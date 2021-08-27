import { Request } from 'express';
import url from 'url';

/**
 * Returns url.
 *
 * @param req
 * @returns {string}
 */
export const getFullUrl = (req: Request) => {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.baseUrl + req.path,
  });
};
