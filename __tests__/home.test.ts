import { SuperAgentTest } from "supertest";
import { OK } from "http-status";
import { initAgent } from "./helpers";
import CONFIG from "@/config";

let agent: SuperAgentTest;

beforeAll(async () => {
  agent = await initAgent();
});

describe("[UNIT] => HOME", () => {
  describe("GET: '/'", () => {
    it("Should return API app information", async () => {
      const response = await agent.get(`/app/${CONFIG.APP.VER}`);
      expect(response.status).toBe(OK);
      expect(Object.keys(response.body.data)).toEqual([
        "NAME",
        "VERSION",
        "VER",
        "DESCRIPTION",
        "AUTHORS",
      ]);
    });
  });
});
