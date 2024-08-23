import { PrismaClient } from "@prisma/client";
import { PlayersDAO } from "./players";
import CONFIG from "@/config";
import { ForbiddenError, NotFoundException } from "@/helpers/error";
import { RoledPlayer } from "@/types/response/players";

const prisma = new PrismaClient();
export class CashierDAO {
  static create = prisma.cashier.create;

  static findFirst = prisma.cashier.findFirst;

  static update = prisma.cashier.update;

  /**
   * Checks if
   * - user has agent role OR
   * - user has cashier role and owns requested resource.
   * @throws {ForbiddenError} if conditions not met
   */
  static authorizeShow(cashierId: string, user: RoledPlayer) {
    if (user.roles.some((role) => role.name === CONFIG.ROLES.AGENT)) return;
    this.authorizeUpdate(cashierId, user);
  }

  /**
   * Checks if
   * - user has cashier role and owns requested resource.
   * @throws {ForbiddenError} if conditions not met
   */
  static authorizeUpdate(cashierId: string, user: RoledPlayer) {
    if (!user.roles.some((role) => role.name === CONFIG.ROLES.CASHIER))
      throw new ForbiddenError("No autorizado");

    if (cashierId !== user.cashier_id)
      throw new ForbiddenError("No autorizado");
  }

  /**
   * Checks if
   * - user has cashier role and owns requested resource.
   * - player is owned by cashier.
   * @throws {ForbiddenError} if conditions not met
   * @throws {NotFoundException} if player not found
   */
  static async authorizeShowPlayer(
    cashierId: string,
    playerId: string,
    user: RoledPlayer,
  ) {
    this.authorizeUpdate(cashierId, user);
    const player = await PlayersDAO._getById(playerId);
    if (!player) throw new NotFoundException("Jugador no encontrado");
    if (player.cashier_id !== cashierId)
      throw new ForbiddenError("El jugador no le pertenece");
  }

  /**
   * Checks if
   * - user has cashier role and owns requested resource.
   * @throws {ForbiddenError} if conditions not met
   */
  static authorizeListPlayers(cashierId: string, user: RoledPlayer) {
    return this.authorizeUpdate(cashierId, user);
  }
}
