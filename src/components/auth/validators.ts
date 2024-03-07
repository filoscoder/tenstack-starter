import { checkSchema } from "express-validator";

export const validateToken = () =>
  checkSchema({
    token: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      trim: true,
    },
  });
