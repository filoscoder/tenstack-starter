import { checkSchema } from "express-validator";

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
      isAlphanumeric: true,
      notEmpty: true,
      trim: true,
      errorMessage: "source is required",
    },
    event: {
      in: ["body"],
      isString: true,
      isAlphanumeric: true,
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
