import { Router } from 'express';
import {
  getPublicEvent,
  getPublicEvents,
  postPublicRegister,
} from '../controllers/registration.controller.js';
import {
  getPublicCertificate,
  postPublicFeedback,
} from '../controllers/insights.controller.js';
import { validate } from '../middleware/validate.js';
import { publicFeedbackSchema } from '../validators/feedback.validator.js';
import { publicRegisterSchema } from '../validators/registration.validator.js';

const router = Router();

router.get('/events', getPublicEvents);
router.get('/events/:slug', getPublicEvent);
router.post('/events/:slug/register', validate(publicRegisterSchema), postPublicRegister);
router.post('/events/:slug/feedback', validate(publicFeedbackSchema), postPublicFeedback);
router.get('/certificates/:qrToken', getPublicCertificate);

export default router;

