import { PrismaClient } from "@prisma/client";
// import { ANALYTICS_EVENTS } from "@/config";
import { AnalyticsDAO } from "@/db/analytics";
import { ResourceService } from "@/services/resource.service";
import { AnalyticsSummary } from "@/types/response/analytics";

export class AnalyticsServices extends ResourceService {
  constructor() {
    super(AnalyticsDAO);
  }

  async summary(): Promise<AnalyticsSummary[]> {
    const prisma = new PrismaClient();

    const result = await prisma.analytics.groupBy({
      by: ["source", "event"],
      _count: {
        event: true,
      },
    });

    return result;
  }
}
