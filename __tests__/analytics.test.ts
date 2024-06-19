import { PrismaClient } from "@prisma/client";
import { SuperAgentTest } from "supertest";
import { CREATED } from "http-status";
import { initAgent } from "./helpers";
import CONFIG from "@/config";

let agent: SuperAgentTest;
let prisma: PrismaClient;
const analyticsRequest = {
  source: "test",
  event: "test",
  data: JSON.stringify({
    test: "test",
  }),
};
let analyticsId: string;

beforeAll(initialize);

afterAll(cleanUp);

describe("[UNIT] => ANALYTICS ROUTER", () => {
  describe("POST: /", () => {
    it("Should create an analytics object", async () => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/analytics`)
        .send(analyticsRequest);

      console.log(response.body);
      expect(response.status).toBe(CREATED);
      expect(Object.keys(response.body.data)).toEqual([
        "id",
        "source",
        "event",
        "data",
        "created_at",
        "updated_at",
      ]);

      analyticsId = response.body.data.id;
    });

    it.each`
      field       | value  | message
      ${"source"} | ${""}  | ${"source is required"}
      ${"source"} | ${"%"} | ${"invalid source"}
      ${"event"}  | ${""}  | ${"event is required"}
      ${"event"}  | ${"%"} | ${"invalid event"}
      ${"data"}   | ${1}   | ${"Invalid value"}
      ${"data"}   | ${"1"} | ${"Invalid value"}
    `("Should return 400 bad_request", async ({ field, value, message }) => {
      const response = await agent
        .post(`/app/${CONFIG.APP.VER}/analytics`)
        .send({ ...analyticsRequest, [field]: value });

      expect(response.status).toBe(400);
      expect(response.body.data[0].msg).toBe(message);
    });
  });

  describe("GET: /", () => {
    it("should return a list of analytics", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}/analytics`);

      expect(response.status).toBe(200);
      expect(Object.keys(response.body.data[0])).toEqual([
        "id",
        "source",
        "event",
        "data",
        "created_at",
        "updated_at",
      ]);
    });
  });

  describe("GET: /:id", () => {
    it("should retrieve object by id", async () => {
      const response = await agent.get(
        `/app/${CONFIG.APP.VER}/analytics/${analyticsId}`,
      );

      expect(response.status).toBe(200);
      expect(Object.keys(response.body.data)).toEqual([
        "id",
        "source",
        "event",
        "data",
        "created_at",
        "updated_at",
      ]);
    });
  });
});

async function initialize() {
  agent = await initAgent();
  prisma = new PrismaClient();
}

async function cleanUp() {
  analyticsId &&
    (await prisma.analytics.delete({ where: { id: analyticsId } }));
  prisma.$disconnect();
}
