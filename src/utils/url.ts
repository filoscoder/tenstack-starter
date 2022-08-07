import url from "url";
import { Request } from "express";

/**
 * @description Retrieve formatted url.
 * @param req
 * @returns {string}
 */
export const getFullUrl = (req: Request): string => {
  return url.format({
    protocol: req.protocol,
    host: req.get("host"),
    pathname: req.baseUrl + req.path,
  });
};
