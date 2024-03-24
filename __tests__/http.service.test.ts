import { UserRootDAO } from "@/db/user-root";
import { HttpService } from "@/services/http.service";

let service: HttpService;
beforeAll(async () => {
  service = new HttpService();
  await UserRootDAO.update({
    access: "",
    refresh: "",
    alq_token: "",
    alq_api_manager: "",
  });
});
describe("HttpService", () => {
  describe("authedAlqApi", () => {
    it("Should return 200", async () => {
      const response = await service.authedAlqApi.get("/perfil");
      expect(response.status).toBe(200);
      expect(Object.keys(response.data)).toEqual([
        "id_cliente",
        "nombre",
        "apellido_paterno",
        "apellido_materno",
        "fecha_nacimiento",
        "sexo",
        "email",
        "rfc",
        "curp",
        "nacionalidad",
        "tipo_usuario",
      ]);
    });
  });

  describe("authedAgentApi", () => {
    it("Should return 200", async () => {
      const response = await service.authedAgentApi.get("/accounts/user");

      expect(response.status).toBe(200);
    });
  });
});
