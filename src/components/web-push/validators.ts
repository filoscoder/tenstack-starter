import { checkSchema } from "express-validator";

export const validatePushSubscriptionRequest = () =>
  checkSchema({
    endpoint: {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
      errorMessage: "endpoint is required",
    },
    keys: {
      in: ["body"],
      isObject: true,
      isEmpty: false,
      errorMessage: "keys is required",
    },
    "keys.p256dh": {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
      errorMessage: "p256dh is required",
    },
    "keys.auth": {
      in: ["body"],
      isString: true,
      isEmpty: false,
      trim: true,
      errorMessage: "auth is required",
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
      errorMessage: "endpoint is required",
    },
  });
