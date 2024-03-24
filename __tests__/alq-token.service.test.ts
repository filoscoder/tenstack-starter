import { UserRootDAO } from "@/db/user-root";
import { AlquimiaTokenService } from "@/services/alquimia-token.service";

let service: AlquimiaTokenService;
beforeAll(async () => {
  service = new AlquimiaTokenService();
  await UserRootDAO.update({ alq_api_manager: "", alq_token: "" });
});

describe("AlquimiaTokenService", () => {
  describe("authenticate", () => {
    it("Should return tokens from API", async () => {
      const auth = await service.authenticate();

      expect(auth).toBeTruthy();
      //@ts-ignore
      expect(Object.keys(auth)).toEqual(["apiManagerToken", "alquimiaToken"]);
    });

    it("Ensures token was saved in DB", async () => {
      const agent = await UserRootDAO.getAgent();
      expect(agent?.alq_token).toBeTruthy();
      expect(agent?.alq_api_manager).toBeTruthy();
    });
  });

  describe("getAuth", () => {
    it("Should return tokens from cache", async () => {
      const auth: string[] | null = await service.getAuth();

      expect(auth).toBeTruthy();
      //@ts-ignore
      expect(Object.keys(auth)).toEqual(["apiManagerToken", "alquimiaToken"]);
    });
  });
});
