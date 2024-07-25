import { BonusDAO } from "@/db/bonus";
import { ResourceService } from "@/services/resource.service";
import { BonusSettings } from "@/types/request/bonus";

export class BonusServices extends ResourceService {
  constructor() {
    super(BonusDAO);
  }

  async create(player_id: string) {
    await BonusDAO.authorizeCreation(player_id);
    const settings = this.getSettings();

    return await BonusDAO.create({ player_id, ...settings });
  }

  private getSettings(): BonusSettings {
    return { percentage: 100, amount: 0 };
  }
}
