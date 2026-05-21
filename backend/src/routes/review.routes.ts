import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { submitReviewSchema } from '../schemas/review.schema';

const router = Router();

router.post('/', requireAuth, validate(submitReviewSchema), ReviewController.submitReview);
router.get('/gig/:gigId(\\d+)', ReviewController.getGigReviews);
router.get('/order/:orderId(\\d+)', ReviewController.getOrderReviews);

export default router;
