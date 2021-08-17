import * as homeController from '@/controller/home';

import { Router } from 'express';

const router = Router();

router.get('/', homeController.getAppInfo);

export default router;
