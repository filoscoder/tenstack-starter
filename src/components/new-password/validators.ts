import { CustomValidator, checkSchema } from "express-validator";
import { checkByteLength } from "../players/validators";
import { PlayersDAO } from "@/db/players";
import { PasswordResetTokenDAO } from "@/db/password-reset-token";

const validatePasswordRestoreToken: CustomValidator = async (
  value,
  { req },
) => {
  const token = await PasswordResetTokenDAO.findByToken(value);
  if (!token || +token.expires_at < Date.now()) throw new Error();
  const player = await PlayersDAO._getById(token.player_id);
  req.user = player;
  await PasswordResetTokenDAO.delete(token.id);
};

export const validateForgotPasswordRequest = () =>
  checkSchema({
    username: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      trim: true,
      errorMessage: "username is required",
    },
  });

export const validateRestorePasswordRequest = () =>
  checkSchema({
    token: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      trim: true,
      custom: {
        options: validatePasswordRestoreToken,
        errorMessage: "invalid token",
      },
      errorMessage: "token is required",
    },
  });

export const validateResetRequest = () =>
  checkSchema({
    new_password: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      trim: true,
      custom: {
        options: checkByteLength,
        errorMessage: "password must be under 73 characters",
      },
      isLength: {
        options: { min: 4 },
        errorMessage: "password must be at least 4 characters long",
      },
      errorMessage: "new_password is required",
    },
    repeat_password: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      trim: true,
      custom: {
        options: (value, { req }) => value === req.body.new_password,
        errorMessage: "repeat_password must match new_password",
      },
      errorMessage: "repeat_password is required",
    },
  });
