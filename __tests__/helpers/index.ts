import supertest, { SuperAgentTest } from "supertest";

import { createApp } from "@/app";

// let dbConnection: Mongoose;

export const initAgent = async (): Promise<SuperAgentTest> => {
  const app = createApp();
  const agent = supertest.agent(app);
  // dbConnection = await mongoDbConnection();
  // await agent.post("/api/v2/auth/signin").send({
  //   email: testUser.email,
  //   password: testUser.password,
  // });

  return agent;
};

// export const closeClients = async (): Promise<void> => {
//   await dbConnection.disconnect();
// };
