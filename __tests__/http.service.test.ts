import { Cashier } from "@prisma/client";
import { prisma } from "@/prisma";
import { HttpService } from "@/services/http.service";
import { CashierDAO } from "@/db/cashier";

let service: HttpService;
let agent: Cashier;

beforeAll(async () => {
  agent = await prisma.player.findAgent();
  service = new HttpService(agent);
  await CashierDAO.update({
    where: { id: agent.id },
    data: {
      access: "",
      refresh: "",
    },
  });
});
describe("HttpService", () => {
  describe.skip("authedAlqApi", () => {
    it("Should return 200", async () => {
      const response = await service.authedAlqApi.get<any>("/perfil");
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
