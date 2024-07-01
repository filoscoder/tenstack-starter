export type PasswordRestoreRequest = {
  username: string;
};

export type PasswordResetTokenCreate = {
  player_id: string;
  token: string;
  expires_at: Date;
};
