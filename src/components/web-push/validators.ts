import { checkSchema } from "express-validator";

export const validatePushSubscriptionRequest = () =>
  checkSchema({
    endpoint: {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
    },
    keys: {
      in: ["body"],
      isObject: true,
      isEmpty: false,
    },
    "keys.p256dh": {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
    },
    "keys.auth": {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
    },
    expirationTime: {
      in: ["body"],
    },
  });

export const validateDeleteRequest = () =>
  checkSchema({
    endpoint: {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
    },
  });
