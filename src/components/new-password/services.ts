import { randomBytes } from "crypto";
import { Player } from "@prisma/client";
import { PlayersDAO } from "@/db/players";
import { PasswordResetTokenDAO } from "@/db/password-reset-token";
import { Mail } from "@/helpers/email/email";
import CONFIG from "@/config";
import { logtailLogger } from "@/helpers/loggers";

export class NewPasswordServices {
  async forgotPassword(username: string): Promise<void> {
    try {
      const player = await PlayersDAO.getByUsername(username);

      if (!player || !player.email) return;

      const token = await this.generateToken();

      await PasswordResetTokenDAO.create({
        token,
        player_id: player.id,
        expires_at: new Date(Date.now() + 1000 * 60 * 10),
      });

      await this.emailToken(player, token);
    } catch (error) {
      if (CONFIG.LOG.LEVEL === "debug") console.error(error);
      if (CONFIG.APP.ENV === "production") logtailLogger.warn(error);
    }
  }

  private async generateToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      randomBytes(256, (err, buff) => {
        if (err) reject(err);
        resolve(buff.toString("base64url"));
      });
    });
  }

  private async emailToken(player: Player, token: string) {
    const mail = new Mail();
    const subject = "Resetear contraseña";
    const body =
      "Para resetear tu contraseña, toca el siguiente botón (tiene una validez de 10 minutos)";
    await mail
      .compose(subject, player.username, body, {
        href: `https://casino-mex.com/pass-reset?token=${token}`,
        name: "Resetear contraseña",
      })
      .send(player.email);
  }
}
