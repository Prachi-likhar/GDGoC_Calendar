import { Router } from 'express';
import { getUsers, patchUser } from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { updateUserSchema } from '../validators/user.validator.js';

const router = Router();

router.use(auth);

router.get('/', role('admin', 'domain_head'), getUsers);
router.patch('/:id', role('admin'), validate(updateUserSchema), patchUser);

export default router;

