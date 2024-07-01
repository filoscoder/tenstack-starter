import { Prisma, PushSubscription } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import CONFIG from "@/config";
import { PlayerResponse } from "@/types/response/players";
import { CoinTransferResult } from "@/types/response/transfers";
import { CustomError } from "@/helpers/error/CustomError";

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

export const parsePrismaError = (
  err:
    | Prisma.PrismaClientKnownRequestError
    | Prisma.PrismaClientValidationError,
): CustomError => {
  let status, code, description;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025":
        status = 404;
        code = "database_error";
        description = "No se encontro el recurso";
        break;
      case "P2002":
        const key = err.message.split("\n").at(-1)?.split("`")[1];
        status = 409;
        code = "database_error";
        description = `Una entrada con ese ${key} ya existe. Error: `;
        break;
      case "P2003":
        status = 409;
        code = "database_error";
        description = "No se puede eliminar, otras entidades dependen de esta";
        break;
      case "P2005":
        status = 400;
        code = "database_error";
        description =
          "Una restricion fallo en la BD: " + err.meta?.["database_error"];
        break;
      case "P2006":
        status = 400;
        code = "database_error";
        description = `El valor provisto ${err.meta?.["field_value"]} para el campo ${err.meta?.["field_name"]} del ${err.meta?.["model_name"]} no es válido`;
        break;
      case "P2011":
        status = 400;
        code = "database_error";
        description = `Violacion de null_constraint en ${err.meta?.constraint}`;
        break;
      case "P2014":
        status = 400;
        code = "database_error";
        description = `El cambio que estas intentando hacer violaria la relacion ${err.meta?.["relation_name"]} entre los modelos ${err.meta?.["model_a_name"]} y ${err.meta?.["model_b_name"]}`;
        break;
      case "P2019":
        status = 400;
        code = "database_error";
        description = `Input error: ${err.meta?.details}`;
        break;
      case "P2020":
        status = 400;
        code = "database_error";
        description = `Valor fuera de rango. ${err.meta?.details}`;
        break;
      default:
        status = 500;
        code = "database_error";
        description = `Error en la base de datos: ${err.message}`;
    }
  } else {
    status = 400;
    code = "database_error";
    description = "Error de validacion de datos ";
    if (!CONFIG.APP.ENV?.includes("production")) {
      description += err.message;
    }
  }
  return new CustomError({ status, code, description });
};
