import { checkSchema } from "express-validator";

const isDashedAlphaNumeric = (value: string) => !/[^a-zA-Z0-9\-_]/.test(value);

export const validateId = () =>
  checkSchema({
    id: {
      in: ["params"],
      isString: true,
      notEmpty: true,
      trim: true,
    },
  });

export const validateAnalyticsRequest = () =>
  checkSchema({
    source: {
      in: ["body"],
      isString: true,
      custom: {
        options: isDashedAlphaNumeric,
        errorMessage: "invalid source",
      },
      notEmpty: true,
      trim: true,
      errorMessage: "source is required",
    },
    event: {
      in: ["body"],
      isString: true,
      custom: {
        options: isDashedAlphaNumeric,
        errorMessage: "invalid event",
      },
      notEmpty: true,
      trim: true,
      errorMessage: "event is required",
    },
    data: {
      in: ["body"],
      isJSON: true,
      optional: true,
    },
  });
