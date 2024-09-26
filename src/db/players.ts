import { Player, Prisma, PrismaClient } from "@prisma/client";
import {
  FullUser,
  PlainPlayerResponse,
  PlayerResponse,
  RoledPlayer,
} from "@/types/response/players";
import {
  OrderBy,
  PlayerRequest,
  PlayerUpdatableProps,
  getPlayerId,
} from "@/types/request/players";
import { parsePlayer } from "@/utils/parser";
import CONFIG from "@/config";
import { ForbiddenError } from "@/helpers/error";

const prisma = new PrismaClient();

export class PlayersDAO {
  static count(where?: Prisma.PlayerWhereInput) {
    try {
      return prisma.player.count({ where });
    } catch (e) {
      throw e;
    } finally {
      prisma.$disconnect();
    }
  }

  static getPlayersQuery(
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<Player>,
    cashierId?: string,
  ) {
    const whereClause: Prisma.PlayerWhereInput = {
      roles: { some: { name: CONFIG.ROLES.PLAYER } },
      AND: {
        OR: [
          { first_name: { contains: search } },
          { last_name: { contains: search } },
          { email: { contains: search } },
          { username: { contains: search } },
          { movile_number: { contains: search } },
        ],
      },
    };

    if (cashierId) whereClause.cashier_id = cashierId;

    return {
      skip: page * itemsPerPage,
      take: itemsPerPage,
      where: whereClause,
      orderBy,
    };
  }

  static _getAll = async (
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<Player>,
  ): Promise<Player[]> => {
    try {
      const query = this.getPlayersQuery(page, itemsPerPage, search, orderBy);
      return await prisma.player.findMany(query);
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static _getAllByCashier = async (
    page: number,
    itemsPerPage: number,
    search?: string,
    orderBy?: OrderBy<Player>,
    cashierId?: string,
  ): Promise<Player[]> => {
    try {
      const query = this.getPlayersQuery(
        page,
        itemsPerPage,
        search,
        orderBy,
        cashierId,
      );
      return await prisma.player.findMany(query);
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  /**
   * @description Get player information by ID.
   * @param playerId ID of the player to retrieve information.
   * @returns Raw player, including sensitive data
   */
  static _getById = async (playerId: getPlayerId): Promise<FullUser | null> => {
    try {
      const playerPrisma = await prisma.player.findUnique({
        where: { id: playerId },
        include: { BankAccounts: true, roles: true, Cashier: true },
      });

      return playerPrisma;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  /**
   * Find Player by username
   * @returns Full Player, including password
   */
  static getByUsername = async (
    username: string,
  ): Promise<RoledPlayer | null> => {
    try {
      const playerPrisma = await prisma.player.findUnique({
        where: { username: username },
        include: { roles: true },
      });

      return playerPrisma;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  /**
   * Find Player by email
   * @returns { PlayerResponse }
   */
  static getByEmail = async (email: string): Promise<PlayerResponse | null> => {
    try {
      const playerPrisma = await prisma.player.findUnique({
        where: { email },
      });

      return parsePlayer(playerPrisma);
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static getAgent = () => {
    try {
      return prisma.player.findFirst({
        where: {
          roles: {
            some: { name: CONFIG.ROLES.AGENT },
          },
        },
      });
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static create = async (
    request: PlayerRequest,
  ): Promise<PlainPlayerResponse> => {
    try {
      const player = await prisma.player.create({
        data: {
          ...request,
          roles: { connect: request.roles.map((r) => ({ name: r })) },
        },
      });
      return player;
    } catch (error: any) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static upsert = (
    username: string,
    update: PlayerUpdatableProps,
    create: PlayerRequest,
  ) => {
    try {
      return prisma.player.upsert({
        where: { username },
        update,
        create: {
          ...create,
          roles: {
            connect: { name: CONFIG.ROLES.PLAYER },
          },
        },
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static update = (playerId: string, update: PlayerUpdatableProps) => {
    try {
      return prisma.player.update({
        where: { id: playerId },
        data: update,
      });
    } catch (error) {
      throw error;
    } finally {
      prisma.$disconnect();
    }
  };

  static authorizeShow(user: RoledPlayer, user_id: string): void {
    if (user.roles.some((role) => role.name === CONFIG.ROLES.AGENT)) return;

    if (user.id !== user_id) throw new ForbiddenError("No autorizado");
  }

  static findFirst = prisma.player.findFirst;

  static filteredPlayersWithUsageMetricsQuery(
    page: number,
    itemsPerPage: number,
    cashierId: string,
    search?: string,
    orderBy?: OrderBy<Player>,
  ): Prisma.Sql {
    let orderByColumn, orderByDirection;
    if (orderBy) {
      orderByColumn = Object.keys(orderBy)[0] as keyof Player;
      orderByDirection = orderBy[orderByColumn];
    }
    const orderByQuery = `ORDER BY ${orderByColumn} ${orderByDirection}`;
    const querySearch = `%${search}%`;

    const query = Prisma.sql`
SELECT p.id as player_id, p.username, p.email, p.movile_number, p.first_name,
       p.last_name, p.created_at,
       d.amount AS deposits_total,
       c.amount AS cashout_total,
       ld.last_deposit
  FROM PLAYERS AS p 
       -- Deposits
       LEFT JOIN (
                  SELECT SUM(amount) AS amount, player_id 
                    FROM DEPOSITS 
                   GROUP BY player_id
                 )    AS d
         ON p.id = d.player_id
       -- Cashouts
       LEFT JOIN (
                  SELECT SUM(amount) AS amount, player_id 
                    FROM PAYMENTS 
                   GROUP BY player_id
                 )    AS c
         ON p.id = c.player_id
       -- Last deposit date
       LEFT JOIN ( 
                  SELECT MAX(created_at) AS last_deposit, player_id
                    FROM DEPOSITS
                   GROUP BY player_id
                 )    AS ld
         ON p.id = ld.player_id
       -- Select only players
       JOIN _PlayerToRole as ptr
         ON p.id = ptr.a
       JOIN ROLES AS r
         ON r.id = ptr.b AND r.name = ${CONFIG.ROLES.PLAYER}
 WHERE cashier_id = ${cashierId}
    ${
      search
        ? Prisma.sql` 
       AND (first_name LIKE ${querySearch}
        OR last_name LIKE ${querySearch}
        OR email LIKE ${querySearch}
        OR username LIKE ${querySearch}
        OR movile_number LIKE ${querySearch})`
        : Prisma.empty
    }
    ${orderBy ? orderByQuery : Prisma.empty}
    LIMIT ${itemsPerPage * page}, ${itemsPerPage}`;

    return query;
  }
}
