import { Router } from 'express';
import {
  getBlockedDates,
  postBlockedDate,
  removeBlockedDate,
} from '../controllers/blockedDate.controller.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { createBlockedDateSchema } from '../validators/blockedDate.validator.js';

const router = Router();

router.use(auth);

router.get('/', getBlockedDates);
router.post('/', role('admin'), validate(createBlockedDateSchema), postBlockedDate);
router.delete('/:id', role('admin'), removeBlockedDate);

export default router;

