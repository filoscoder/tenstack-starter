import AppInformation from "@/types/response/AppInformation";
import CONFIG from "@/config";
import { getAppInfoQuery } from "@/types/request/home";

export class HomeDAO {
  get = (key?: getAppInfoQuery): Promise<AppInformation | any> => {
    if (!key) {
      return Promise.resolve(CONFIG.INFO);
    }
    const upperKey = key.toUpperCase() as keyof typeof CONFIG.INFO;

    return Promise.resolve({ [upperKey]: CONFIG.INFO[upperKey] });
  };
}
