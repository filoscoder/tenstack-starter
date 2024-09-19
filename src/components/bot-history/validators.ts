import { BotHistory } from "@prisma/client";
import { isKeyOfNestedObject } from "../players/validators";

export const isKeyOfBotHistory = (key: string): key is keyof BotHistory => {
  const mockBotHistory: BotHistory = {
    id: "",
    answer: "",
    from: "",
    keyword: "",
    options: "",
    ref: "",
    refSerialize: "",
    created_at: new Date(),
    updated_at: new Date(),
  };
  return isKeyOfNestedObject(mockBotHistory, key);
};
