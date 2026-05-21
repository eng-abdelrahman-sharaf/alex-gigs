import { Router } from 'express';
import authRoutes from './auth.routes';
import buyerRoutes from './buyer.routes';
import freelancerRoutes from './freelancer.routes';
import gigRoutes from './gig.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/buyers', buyerRoutes);
router.use('/freelancers', freelancerRoutes);
router.use('/gigs', gigRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);

export default router;
