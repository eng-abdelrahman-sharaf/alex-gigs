import { Router } from 'express';
import { BuyerController } from '../controllers/buyer.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema } from '../schemas/buyer.schema';

const router = Router();

router.get('/profile', requireAuth, BuyerController.getProfile);
router.patch('/profile', requireAuth, validate(updateProfileSchema), BuyerController.updateProfile);

export default router;
