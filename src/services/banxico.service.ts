import { Deposit } from "@prisma/client";
import axios, { AxiosResponse } from "axios";
import { XMLParser } from "fast-xml-parser";
import CONFIG, { ENVIRONMENTS } from "@/config";
import { logtailLogger } from "@/helpers/loggers";
import { DepositsDAO } from "@/db/deposits";
import { Telegram } from "@/notification/telegram";
import { AnalyticsDAO } from "@/db/analytics";
import { bankCodes } from "@/config/bank-codes";
import { AgentConfigDAO } from "@/db/agentConfig";
import { CustomError } from "@/helpers/error/CustomError";
import { ERR } from "@/config/errors";

export class BanxicoService {
  private url = "https://www.banxico.org.mx/cep/valida.do";
  private deposit!: Deposit;

  public async verifyDeposit(deposit: Deposit): Promise<number | undefined> {
    this.deposit = deposit;
    const cookies = await this.prepareCepDownload(deposit);
    if (!cookies) return;

    const query = await this.queryDepositStatus(deposit);
    if (!query) return;
    const queryAmount = this.analyzeQueryResult(query);
    if (!queryAmount) return;

    const cep = await this.cepDownload(cookies);
    const cepAmount = await this.analyzeCep(cep);

    await this.cepAnalytics(deposit, cep, cepAmount, queryAmount);

    return queryAmount;
  }

  /**
   * @returns cookie value or undefined if not found
   */
  private async prepareCepDownload(
    deposit: Deposit,
  ): Promise<string | undefined> {
    const data = await this.generateRequestData(deposit, "1");

    try {
      const response = await axios.post(this.url, data, {
        validateStatus: () => true,
        responseType: "text",
      });
      if (
        response.status !== 200 ||
        (response.data as string).includes("Operación no encontrada")
      )
        throw response.data;

      const cookies = response.headers["set-cookie"];
      if (!cookies)
        throw new Error("Banxico cookie not found when searching for deposit");

      cookies.forEach((cookie, i) => (cookies[i] = cookie.split(";")[0]));

      return cookies.join("; ");
    } catch (e: any) {
      this.errorHandler(e);
      return;
    }
  }

  /**
   * @returns deposit amount or undefined if error
   */
  private async cepDownload(cookie: string): Promise<string | undefined> {
    const url = "https://www.banxico.org.mx/cep/descarga.do?formato=XML";
    try {
      const xmlResponse = await axios.get(url, {
        responseType: "text",
        headers: {
          Cookie: cookie,
        },
        validateStatus: () => true,
      });

      if (xmlResponse.status !== 200) throw new Error(xmlResponse.data);

      return xmlResponse.data;
    } catch (e: any) {
      this.errorHandler(e);
      return;
    }
  }

  /**
   * Extract transfer amount from CEP in XML format
   */
  private analyzeCep(cep: string | undefined): number | undefined {
    if (!cep || cep.length === 0) return;
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
      });

      const parsed = parser.parse(cep, true);
      const amountString = parsed.SPEI_Tercero?.Beneficiario?.MontoPago;
      if (!amountString) throw new Error("Banxico XML malformed");

      return parseFloat(amountString);
    } catch (e) {
      this.errorHandler(e);
      return;
    }
  }

  private async queryDepositStatus(
    deposit: Deposit,
  ): Promise<string | undefined> {
    const data = await this.generateRequestData(deposit, "0");
    try {
      const response = await axios.post(this.url, data);
      if (response.status !== 200) throw response.data;

      if (response.data.includes("Operación no encontrada")) return;

      return response.data;
    } catch (e: any) {
      this.errorHandler(e.data ?? e);
      return;
    }
  }

  private analyzeQueryResult(query: string): number | undefined {
    try {
      const match = query.match(/<tbody>[\s\S]*?<\/tbody>/);
      if (!match || match.length != 1)
        throw new Error("Banxico query result malformed");
      const table = match[0];

      const rows = table.split("<td>");
      const statusIndex =
        rows.findIndex((r) => r.includes("Estado del pago en Banxico")) + 1;
      const status = rows[statusIndex].split("</td>")[0].trim();

      if (status !== "Liquidado") return;

      const amountIndex = rows.findIndex((r) => r.includes("Monto")) + 1;
      const amountString = rows[amountIndex].split("</td>")[0].trim();
      return parseFloat(amountString);
    } catch (e) {
      this.errorHandler(e);
      return;
    }
  }

  /**
   * @returns bank ID
   */
  public async findBank(deposit: Deposit): Promise<string | null> {
    const requestDataArr = [];
    for (let i = 0; i < 2; i++) {
      const reqData = await this.generateRequestData(
        { ...deposit, sending_bank: bankCodes[i] },
        "1",
      );
      requestDataArr.push(reqData);
    }

    const requests = requestDataArr.map(
      (data) =>
        new Promise<AxiosResponse<string>>((resolve, reject) => {
          axios
            .post<string>(this.url, data, { responseType: "text" })
            .then((r) => {
              if (CONFIG.LOG.LEVEL === "debug")
                console.log("\n[DEBUG] BANK RESPONSE\n", r.data);

              r.data.includes(
                "Haga clic sobre el &iacute;cono para descargar el CEP",
              )
                ? resolve(r)
                : reject(r.data);
            });
        }),
    );

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const successful = await Promise.any(requests).catch(() => undefined);
    if (!successful) return null;

    const queryString = new URLSearchParams(successful.config.data);
    return queryString.get("emisor");
  }

  /**
   * @param queryType 1: CEP, 0: Payment status
   */
  private async generateRequestData(
    deposit: Deposit,
    queryType: "1" | "0",
  ): Promise<URLSearchParams> {
    const bankAccount = await AgentConfigDAO.getBankAccount();
    if (!bankAccount) throw new CustomError(ERR.AGENT_BANK_ACCOUNT_UNSET);

    const day = deposit.date.getDate(),
      month = (deposit.date.getMonth() + 1).toString().padStart(2, "0"),
      year = deposit.date.getFullYear(),
      date = `${day}-${month}-${year}`,
      data = new URLSearchParams();

    data.append("tipoCriterio", "T");
    data.append("fecha", date);
    data.append("criterio", deposit.tracking_number);
    data.append("emisor", deposit.sending_bank);
    data.append("receptor", `${bankAccount.bankId}`);
    data.append("cuenta", `${bankAccount.clabe}`);
    data.append("receptorParticipante", "0");
    data.append("monto", `${deposit.amount}`);
    data.append("captcha", "c");
    data.append("tipoConsulta", queryType);

    return data;
  }

  private async cepAnalytics(
    deposit: Deposit,
    cep: string | undefined,
    cepAmount: number | undefined,
    queryAmount: number | undefined,
  ) {
    if (!cep) {
      await AnalyticsDAO.create({
        source: "cep",
        event: "cep_download_failed",
      });
    } else if (cepAmount !== queryAmount) {
      await AnalyticsDAO.create({
        source: "cep",
        event: "deposit_amount_mismatch",
      });
    } else {
      await AnalyticsDAO.create({
        source: "cep",
        event: "allisgood",
      });
      await DepositsDAO.update({
        where: { id: deposit.id },
        data: { cep_ok: true },
      });
      return;
    }
    await DepositsDAO.update({
      where: { id: deposit.id },
      data: { cep_ok: false },
    });
  }

  private async errorHandler(e: any) {
    if (CONFIG.LOG.LEVEL === "debug") console.error(e);
    if (CONFIG.APP.ENV === ENVIRONMENTS.PRODUCTION) {
      logtailLogger.error(e);
      const stringifiedError = `${e?.toString() ?? e.message ?? e}`;
      await Telegram.arturito(
        stringifiedError +
          "\n\n" +
          "No se puede verificar el depósito, necesitamos la intervención de" +
          " un humano\\." +
          "\n\n" +
          "Número de seguimiento: " +
          this.deposit.tracking_number,
      );
    }
  }
}
