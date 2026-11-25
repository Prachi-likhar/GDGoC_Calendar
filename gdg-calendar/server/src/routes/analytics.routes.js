import { Router } from 'express';
import { getOverview } from '../controllers/insights.controller.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';

const router = Router();

router.use(auth);
router.get('/overview', role('admin', 'domain_head'), getOverview);

export default router;

