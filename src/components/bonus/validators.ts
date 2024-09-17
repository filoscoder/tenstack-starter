import { Bonus, Player } from "@prisma/client";
import { checkSchema } from "express-validator";
import { isKeyOfNestedObject } from "../players/validators";
import { validatePlayerId } from "@/helpers/validateUserId";
import { mockPlayer } from "@/config/mockPlayer";

export const isKeyOfBonus = (key: string): key is keyof Bonus => {
  const mockBonus: Bonus & { Player: Player } = {
    id: "",
    amount: 0,
    percentage: 0,
    player_id: "",
    status: "",
    coin_transfer_id: "",
    dirty: false,
    Player: mockPlayer,
    created_at: new Date(),
    updated_at: new Date(),
  };
  return isKeyOfNestedObject(mockBonus, key);
};

export const validateBonusId = () =>
  checkSchema({
    id: {
      in: ["params"],
      isString: true,
      isEmpty: false,
      trim: true,
    },
  });

export const validateBonusCreateRequest = () =>
  checkSchema({
    player_id: {
      in: ["body"],
      isString: true,
      isEmpty: false,
      custom: { options: validatePlayerId, errorMessage: "invalid player ID" },
    },
  });
