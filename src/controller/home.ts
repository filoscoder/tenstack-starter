import * as homeService from '@/service/home';

import { Request, Response } from 'express';

/**
 * Gets the API information.
 *
 * @param {Request} req
 * @param {Response} res
 */
export function getAppInfo(req: Request, res: Response) {
  const result = homeService.getAppInfo();

  res.json(result);
}
