import CONFIG from "@/config";

export type getAppInfoQuery = `${Lowercase<keyof typeof CONFIG.APP>}`;
