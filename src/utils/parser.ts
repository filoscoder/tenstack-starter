import { PushSubscription } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import CONFIG from "@/config";
import { PlayerResponse } from "@/types/response/players";
import { CoinTransferResult } from "@/types/response/transfers";

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
  type: "deposit" | "withdrawal",
): CoinTransferResult => {
  const ok = transfer.status === 201;
  let player_balance: number | undefined = undefined;

  ok && type === "deposit"
    ? (player_balance = transfer.data.recipient_balance_after)
    : "";
  ok && type === "withdrawal"
    ? (player_balance = transfer.data.sender_balance_after)
    : "";
  !ok && type === "withdrawal"
    ? (player_balance = transfer.data.variables.balance_amount)
    : "";

  const result: CoinTransferResult = {
    status: ok ? "COMPLETED" : "INCOMPLETE",
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
