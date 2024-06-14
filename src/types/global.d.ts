import { Request, Response, NextFunction } from "express";
import { Player, Role } from "@prisma/client";

declare global {
  type TodoType = any;
  type Req = Request;
  type Res = Response;
  type NextFn = NextFunction;
  type SortDirection = "asc" | "desc";

  namespace Express {
    interface User extends Player {
      roles: Role[];
    }
  }
}
