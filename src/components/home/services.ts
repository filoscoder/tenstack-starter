import AppInformation from "@/types/response/AppInformation";
import { HomeDAO } from "@/db/home";
import { getAppInfoQuery } from "@/types/request/home";

export class HomeServices {
  homeDAO!: HomeDAO;
  constructor() {
    this.homeDAO = new HomeDAO();
  }
  // NAME: pkg.name,
  // VERSION: pkg.version,
  // VER: `v${pkg.version[0]}`,
  // DESCRIPTION: pkg.description,
  // AUTHORS: pkg.authors,

  /**
   * @description Get application information.
   * @returns AppInformation
   */
  getAppInfo = async (
    appInfoKey?: getAppInfoQuery,
  ): Promise<AppInformation> => {
    const result = await this.homeDAO.get(appInfoKey);

    return result;
  };
}
