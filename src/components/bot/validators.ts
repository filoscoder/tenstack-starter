import { checkSchema } from "express-validator";
import { BLACKLIST_METHOD, GLOBAL_SWITCH_STATE } from "@/config";

const isValidBlacklistMethod = (
  val: BLACKLIST_METHOD,
): val is BLACKLIST_METHOD => Object.values(BLACKLIST_METHOD).includes(val);

const isValidBotSwitchState = (
  val: GLOBAL_SWITCH_STATE,
): val is GLOBAL_SWITCH_STATE =>
  Object.values(GLOBAL_SWITCH_STATE).includes(val);

export const validateQrName = () =>
  checkSchema({
    name: {
      in: ["params"],
      isString: true,
      isEmpty: false,
      trim: true,
      optional: true,
      isLength: {
        options: { min: 1, max: 10 },
      },
      customSanitizer: {
        options: (value: string) =>
          value.toLowerCase().replaceAll(/[^a-z]/g, ""),
      },
    },
  });

export const validateBlacklistRequest = () =>
  checkSchema({
    number: {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
      isLength: {
        options: { min: 1, max: 20 },
        errorMessage: "Number must be between 1 and 20 characters long",
      },
      errorMessage: "number is required",
    },
    method: {
      in: ["body"],
      isEmpty: false,
      custom: {
        options: isValidBlacklistMethod,
        errorMessage: "Invalid method",
      },
      errorMessage: "method is required",
    },
  });

export const validateSwitchRequest = () =>
  checkSchema({
    state: {
      in: ["body"],
      isEmpty: false,
      custom: {
        options: isValidBotSwitchState,
        errorMessage: "Invalid state",
      },
      errorMessage: "state is required",
    },
  });
