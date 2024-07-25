import { BonusDAO } from "@/db/bonus";
import { ResourceService } from "@/services/resource.service";
import { CreateBonusProps } from "@/types/request/bonus";

export class BonusServices extends ResourceService {
  constructor() {
    super(BonusDAO);
  }

  async create(request: CreateBonusProps, player_id: string) {
    await BonusDAO.authorizeCreation(player_id);

    return await BonusDAO.create(request);
  }
}
