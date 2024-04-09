import { AlquimiaDeposit, PushSubscription } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import CONFIG from "@/config";
import { PlayerResponse } from "@/types/response/players";
import { CoinTransferResult } from "@/types/response/transfers";
import { AlqMovementResponse } from "@/types/response/alquimia";

export const parsePlayer = (playerDB: any): PlayerResponse | null => {
  return !playerDB
    ? null
    : {
        id: playerDB.id,
        username: playerDB.username,
        email: playerDB.email,
        first_name: playerDB.first_name,
        last_name: playerDB.last_name,
        date_of_birth: playerDB.date_of_birth,
        movile_number: playerDB.movile_number,
        country: playerDB.country,
        bank_accounts: playerDB.BankAccounts,
        balance_currency: playerDB.balance_currency,
        status: playerDB.status,
        created_at: playerDB.created_at,
        updated_at: playerDB.updated_at,
      };
};

export const parseTransferResult = (
  transfer: any,
  type: "deposit" | "cashout",
): CoinTransferResult => {
  const ok = transfer.status === 201;
  let player_balance: number | undefined = undefined;

  ok && type === "deposit"
    ? (player_balance = transfer.data.recipient_balance_after)
    : "";
  ok && type === "cashout"
    ? (player_balance = transfer.data.sender_balance_after)
    : "";
  !ok && type === "cashout"
    ? (player_balance = transfer.data.variables.balance_amount)
    : "";

  const result: CoinTransferResult = {
    ok,
    player_balance,
    error: ok ? undefined : CONFIG.SD.INSUFICIENT_BALANCE,
  };
  return result;
};

export const parseSubscription = (subscription: PushSubscription) => {
  subscription.keys = JSON.parse(subscription.keys as string);
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: (subscription.keys as JsonObject).p256dh as string,
      auth: (subscription.keys as JsonObject).auth as string,
    },
  };
};

export const parseAlqMovement = (
  movement: AlqMovementResponse,
): AlquimiaDeposit => ({
  id_transaccion: movement.id_transaccion,
  tipo_transaccion: movement.tipo_transaccion,
  id_cuenta_ahorro: movement.id_cuenta_ahorro,
  id_medio_pago: movement.id_medio_pago,
  id_cliente: movement.id_cliente,
  tipo_movimiento: movement.tipo_movimiento,
  tipo_cargo: movement.tipo_cargo,
  tipo_operacion: movement.tipo_operacion,
  fecha_alta: new Date(movement.fecha_alta.replace(/\s/, "T") + "Z"),
  fecha_actualizacion: new Date(
    movement.fecha_actualizacion.replace(/\s/, "T") + "Z",
  ),
  concepto: movement.concepto,
  estatus_transaccion: movement.estatus_transaccion,
  clave_rastreo: movement.clave_rastreo,
  id_cuenta_ahorro_medio_pago: movement.id_cuenta_ahorro_medio_pago,
  fecha_operacion: new Date(movement.fecha_operacion.replace(/\s/, "T") + "Z"),
  monto: movement.monto,
  valor_real: movement.valor_real,
});
