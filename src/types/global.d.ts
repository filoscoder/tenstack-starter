import { Request, Response, NextFunction } from "express";
import {
  BankAccount,
  Cashier,
  Player,
  Prisma,
  PrismaClient,
  Role,
} from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

declare global {
  type TodoType = any;
  type Req = Request;
  type Res = Response;
  type NextFn = NextFunction;
  type SortDirection = "asc" | "desc";
  type PrismaTransactionClient = Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;

  namespace Express {
    interface User extends Player {
      roles: Role[];
      BankAccounts: BankAccount[];
      Cashier: Cashier | null;
    }
  }
}
