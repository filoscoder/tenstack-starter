import { Deposit } from "@prisma/client";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import CONFIG from "@/config";
import { logtailLogger } from "@/helpers/loggers";

export class BanxicoService {
  public async verifyDeposit(deposit: Deposit): Promise<number | undefined> {
    const cookie = await this.depositLookup(deposit);

    if (!cookie) return;

    return await this.depositDownload(cookie);
  }

  /**
   * @returns cookie value or undefined if not found
   */
  private async depositLookup(deposit: Deposit): Promise<string | undefined> {
    const url = "https://www.banxico.org.mx/cep/valida.do",
      day = deposit.date.getDate(),
      month = (deposit.date.getMonth() + 1).toString().padStart(2, "0"),
      year = deposit.date.getFullYear(),
      date = `${day}-${month}-${year}`,
      data = new URLSearchParams();

    data.append("tipoCriterio", "T");
    data.append("fecha", date);
    data.append("criterio", deposit.tracking_number);
    data.append("emisor", deposit.sending_bank);
    data.append("receptor", `${CONFIG.RECEIVING_BANK.BANK_ID}`);
    data.append("cuenta", `${CONFIG.RECEIVING_BANK.CLABE}`);
    data.append("receptorParticipante", "0");
    data.append("monto", `${deposit.amount}`);
    data.append("captcha", "c");
    data.append("tipoConsulta", "1");

    try {
      const response = await axios.post(url, data);
      if (response.status !== 200) throw response.data;

      const cookie = response.headers["set-cookie"]?.find((c) =>
        c.startsWith("JSESSIONID"),
      );

      if (!cookie)
        throw new Error("Banxico cookie not found when searching for deposit");

      return cookie.split(";")[0];
    } catch (e) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
      if (CONFIG.APP.ENV === CONFIG.SD.ENVIRONMENTS.PRODUCTION)
        logtailLogger.error(e);
      return;
    }
  }

  /**
   * @returns deposit amount or undefined if error
   */
  private async depositDownload(cookie: string): Promise<number | undefined> {
    const url = "https://www.banxico.org.mx/cep/descarga.do?formato=XML";
    try {
      const xmlResponse = await axios.get(url, {
        responseType: "text",
        headers: {
          Cookie: cookie,
        },
      });

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
      });

      const parsed = parser.parse(xmlResponse.data, true);
      const amountString = parsed.SPEI_Tercero?.Beneficiario?.MontoPago;
      if (!amountString) throw new Error("Banxico XML malformed");

      return parseFloat(amountString);
    } catch (e) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(e);
      if (CONFIG.APP.ENV === CONFIG.SD.ENVIRONMENTS.PRODUCTION)
        logtailLogger.error(e);
      return;
    }
  }
}
