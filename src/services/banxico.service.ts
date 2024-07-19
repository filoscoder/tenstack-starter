import { Deposit } from "@prisma/client";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import CONFIG from "@/config";
import { logtailLogger } from "@/helpers/loggers";
import { UserRootDAO } from "@/db/user-root";
import { RootBankAccount } from "@/types/request/user-root";
import { DepositsDAO } from "@/db/deposits";
import { Telegram } from "@/notification/telegram";
import { AnalyticsDAO } from "@/db/analytics";

export class BanxicoService {
  private url = "https://www.banxico.org.mx/cep/valida.do";

  public async verifyDeposit(deposit: Deposit): Promise<number | undefined> {
    const cookies = await this.prepareCepDownload(deposit);
    if (!cookies) return;

    const cep = await this.cepDownload(cookies);
    const cepAmount = await this.analyzeCep(cep);

    const query = await this.queryDepositStatus(deposit);
    if (!query) return;
    const queryAmount = this.analyzeQueryResult(query);

    await this.cepAnalytics(deposit, cep, cepAmount, queryAmount);

    return queryAmount;
  }

  /**
   * @returns cookie value or undefined if not found
   */
  private async prepareCepDownload(
    deposit: Deposit,
  ): Promise<string | undefined> {
    const data = await this.requestData(deposit, "1");

    try {
      const response = await axios.post(this.url, data, {
        validateStatus: () => true,
      });
      if (response.status !== 200) throw response.data;

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
    const data = await this.requestData(deposit, "0");
    try {
      const response = await axios.post(this.url, data);
      if (response.status !== 200) throw response.data;

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
   * @param queryType 1: CEP, 0: Payment status
   */
  private async requestData(
    deposit: Deposit,
    queryType: "1" | "0",
  ): Promise<URLSearchParams> {
    const agent = await UserRootDAO.getAgent();
    const bankAccount = agent!.bankAccount as RootBankAccount;
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
      await DepositsDAO.update(deposit.id, { cep_ok: true });
      return;
    }
    await DepositsDAO.update(deposit.id, { cep_ok: false });
  }

  private async errorHandler(e: any) {
    if (CONFIG.LOG.LEVEL === "debug") console.error(e);
    if (CONFIG.APP.ENV === CONFIG.SD.ENVIRONMENTS.PRODUCTION) {
      logtailLogger.error(e);
      await Telegram.arturito(e);
    }
  }
}
