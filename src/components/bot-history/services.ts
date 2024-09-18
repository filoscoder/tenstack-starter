import { BotHistoryDAO } from "@/db/bot-history";
import { ResourceService } from "@/services/resource.service";

export class BotHistoryServices extends ResourceService {
  constructor() {
    super(BotHistoryDAO);
  }
}
