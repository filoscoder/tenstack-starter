import { Analytics } from "@prisma/client";
import { checkSchema } from "express-validator";
import { isKeyOfNestedObject } from "../players/validators";

const isDashedAlphaNumeric = (value: string) => !/[^a-zA-Z0-9\-_]/.test(value);

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

export const isKeyOfAnalytics = (key: string): key is keyof Analytics => {
  const mockAnalytics: Analytics = {
    id: "",
    source: "",
    event: "",
    data: {},
    created_at: new Date(),
    updated_at: new Date(),
  };
  return isKeyOfNestedObject(mockAnalytics, key);
};
