import supertest, { SuperAgentTest } from "supertest";

import { PrismaClient } from "@prisma/client";
import { createApp } from "@/app";

export const initAgent = async (): Promise<SuperAgentTest> => {
  const app = createApp();
  const agent = supertest.agent(app);

  return agent;
};

export const testPrisma = new PrismaClient();
