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

    // it.each`
    //   query            | field            | expectedStatus
    //   ${"name"}        | ${"NAME"}        | ${OK}
    //   ${"version"}     | ${"VERSION"}     | ${OK}
    //   ${"description"} | ${"DESCRIPTION"} | ${OK}
    //   ${"authors"}     | ${"AUTHORS"}     | ${OK}
    //   ${"port"}        | ${"PORT"}        | ${OK}
    //   ${"env"}         | ${"ENV"}         | ${OK}
    // `(
    //   "Should return CONFIG.APP[$field] value when query.key is `$query`",
    //   async ({
    //     query,
    //     field,
    //     expectedStatus,
    //   }: {
    //     query: string;
    //     field: keyof typeof CONFIG.APP;
    //     expectedStatus: string;
    //   }) => {
    //     const response = await agent
    //       .get(`/api/${CONFIG.APP.VER}`)
    //       .query({ key: query });

    //     expect(response.body.status).toBe(expectedStatus);
    //     expect(response.body.data[field]).toBe(CONFIG.APP[field]);
    //   },
    // );

    // it("Should return 400 status Validation Error", async () => {
    //   const invalidQuery = "invalid-field";
    //   const response = await agent
    //     .get(`/api/${CONFIG.APP.VER}`)
    //     .query({ key: invalidQuery });

    //   expect(response.body.status).toBe(BAD_REQUEST);
    //   expect(response.body.message).toBe(BAD_REQUEST);
    // });
  });
});
