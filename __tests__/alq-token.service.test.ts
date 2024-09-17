import { testPrisma } from "./helpers";
import { AlquimiaTokenService } from "@/services/alquimia-token.service";

let service: AlquimiaTokenService;
beforeAll(async () => {
  service = new AlquimiaTokenService();
  await testPrisma.agentConfig.updateMany({
    data: { alq_api_manager: "", alq_token: "" },
  });
  // await UserRootDAO.update({ alq_api_manager: "", alq_token: "" });
});

describe.skip("AlquimiaTokenService", () => {
  describe("authenticate", () => {
    it("Should return tokens from API", async () => {
      const auth = await service.authenticate();

      expect(auth).toBeTruthy();
      expect(auth?.length).toBe(2);
    });

    it("Ensures token was saved in DB", async () => {
      const config = await testPrisma.agentConfig.findFirst();
      expect(config?.alq_token).toBeTruthy();
      expect(config?.alq_api_manager).toBeTruthy();
    });
  });

  describe("getAuth", () => {
    it("Should return tokens from cache", async () => {
      const auth: string[] | null = await service.getAuth();

      expect(auth).toBeTruthy();
      expect(auth?.length).toBe(2);
    });
  });
});
