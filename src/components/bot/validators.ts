import { checkSchema } from "express-validator";

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
