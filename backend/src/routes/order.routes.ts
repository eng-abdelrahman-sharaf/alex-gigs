import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { requireAuth, requireFreelancer } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { bookOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema';

const router = Router();

router.post('/', requireAuth, validate(bookOrderSchema), OrderController.bookOrder);
router.get('/buyer', requireAuth, OrderController.getBuyerOrders);
router.get('/freelancer', requireAuth, requireFreelancer, OrderController.getFreelancerOrders);
router.get('/:id(\\d+)', requireAuth, OrderController.getOrderDetails);
router.patch('/:id(\\d+)/status', requireAuth, validate(updateOrderStatusSchema), OrderController.updateOrderStatus);

export default router;
