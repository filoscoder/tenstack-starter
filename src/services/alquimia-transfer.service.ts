import { BankAccount, Payment } from "@prisma/client";
import { HttpService } from "./http.service";
import CONFIG from "@/config";
import { AlquimiaApiError } from "@/helpers/error/AlquimiaApiError";
import {
  AlqStatusTx,
  AlqCreateTxResponse,
  AlqAuthorizeTxResponse,
} from "@/types/response/alquimia";
import { PaymentsDAO } from "@/db/payments";
import { CustomError } from "@/helpers/error/CustomError";

export class AlquimiaTransferService {
  private httpService: HttpService;

  constructor(private payment: Payment & { BankAccount: BankAccount }) {
    this.httpService = new HttpService();
  }

  async pay(): Promise<AlqStatusTx> {
    try {
      switch (this.payment.status) {
        //@ts-ignore
        case CONFIG.SD.PAYMENT_STATUS.REQUESTED:
          await this.createTx();
        //@ts-ignore
        case CONFIG.SD.PAYMENT_STATUS.PENDING:
          await this.authorizeTx();
        default:
          return await this.statusTx();
      }
    } catch (e) {
      if (this.payment.alquimia_id)
        await PaymentsDAO.update(this.payment.id, {
          alquimia_id: this.payment.alquimia_id,
        });
      throw e;
    }
  }

  private async createTx() {
    const url = "/guardar-transacciones";
    const data = {
      cuenta_origen: 120902,
      id_cliente: 2733226,
      medio_pago: 4,
      importe: this.payment.amount,
      cuenta_destino: this.payment.BankAccount.bankNumber,
      nombre_beneficiario: this.payment.BankAccount.bankName,
      rfc_beneficiario: "NA",
      concepto: "casino-mex.com",
      no_referencia: 101010,
      api_key: CONFIG.EXTERNAL.ALQ_API_KEY,
    };
    const response =
      await this.httpService.authedAlqApi.post<AlqCreateTxResponse>(url, data);

    if (response.status === 200)
      this.payment.alquimia_id = response.data.id_transaccion;
    else if (response.status === 422)
      throw new CustomError({
        status: 422,
        code: "transfer_error",
        description: response.data.message,
      });
    else
      throw new AlquimiaApiError(
        response.status,
        "Error en alquimia durante transferencia saliente",
        response.data,
      );
  }

  private async authorizeTx(): Promise<void> {
    const url = "/ordenes-importador";
    const data = {
      id_transaccion: this.payment.alquimia_id,
      accion: 1,
      id_cuenta: CONFIG.EXTERNAL.ALQ_SAVINGS_ACCOUNT_ID,
      api_key: CONFIG.EXTERNAL.ALQ_API_KEY,
    };
    const response =
      await this.httpService.authedAlqApi.post<AlqAuthorizeTxResponse>(
        url,
        data,
      );

    if (response.status === 200 && !response.data.error) return;

    throw new AlquimiaApiError(
      response.status,
      "Error en alquimia al autorizar transferencia",
      response.data,
    );
  }

  private async statusTx(): Promise<AlqStatusTx> {
    const url = `/consulta-estatus-tx?id_transaccion=${this.payment.alquimia_id}`;
    const response = await this.httpService.authedAlqApi.get<AlqStatusTx>(url);

    if (response.status === 200) return response.data;

    throw new AlquimiaApiError(
      response.status,
      "Error en alquimia al consultar estado de transferencia",
      response.data,
    );
  }
}
