import { Player } from "@prisma/client";

export const mockPlayer: Player = {
  id: "",
  panel_id: 0,
  username: "",
  password: "",
  email: "",
  first_name: "",
  last_name: "",
  date_of_birth: new Date(),
  movile_number: "",
  country: "",
  balance_currency: "",
  status: "",
  cashier_id: "",
  created_at: new Date(),
  updated_at: new Date(),
};
