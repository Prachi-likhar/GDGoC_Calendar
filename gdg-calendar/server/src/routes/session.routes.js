import { Router } from 'express';
import { patchSession, removeSession } from '../controllers/session.controller.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { updateSessionSchema } from '../validators/session.validator.js';

const router = Router();

router.use(auth);

router.patch('/:id', role('admin', 'domain_head'), validate(updateSessionSchema), patchSession);
router.delete('/:id', role('admin', 'domain_head'), removeSession);

export default router;

