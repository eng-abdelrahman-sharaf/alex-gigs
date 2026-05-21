import { Router } from 'express';
import { FreelancerController } from '../controllers/freelancer.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { onboardSchema, updateFreelancerSchema, setAvailabilitySchema } from '../schemas/freelancer.schema';

const router = Router();

router.post('/onboard', requireAuth, validate(onboardSchema), FreelancerController.onboard);
router.get('/me', requireAuth, FreelancerController.getOwnProfile);
router.get('/profile/:id', FreelancerController.getFreelancerProfile);
router.patch('/profile', requireAuth, validate(updateFreelancerSchema), FreelancerController.updateProfile);
router.post('/availability', requireAuth, validate(setAvailabilitySchema), FreelancerController.setAvailability);

export default router;
