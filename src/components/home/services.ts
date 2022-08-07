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
  // HOST: process.env.APP_HOST,
  // BASE_URL: process.env.API_BASE_URL,
  // PORT: process.env.NODE_ENV === "test" ? 8888 : process.env.PORT || 8080,
  // ENV: process.env.NODE_ENV,

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
