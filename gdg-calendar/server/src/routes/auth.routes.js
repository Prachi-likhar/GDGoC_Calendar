import { Router } from 'express';
import { changePassword, login, me, register } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', auth, me);
router.post('/register', auth, role('admin'), validate(registerSchema), register);
router.patch('/password', auth, validate(changePasswordSchema), changePassword);

export default router;

