import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { AppError } from '../middleware/error.middleware';

export class OrderController {
  static async bookOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const { package_id, payment_method, additional_details } = req.body;
      const order = await OrderService.bookOrder(buyerId, package_id, payment_method, additional_details);

      res.status(201).json({
        status: 'success',
        message: 'Order booked successfully',
        data: {
          order
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const order = await OrderService.getOrderDetails(userId, id);
      res.status(200).json({
        status: 'success',
        data: {
          order
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { status } = req.body;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const order = await OrderService.updateOrderStatus(userId, id, status);
      res.status(200).json({
        status: 'success',
        message: `Order status updated to ${status} successfully`,
        data: {
          order
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBuyerOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const orders = await OrderService.getBuyerOrders(buyerId);
      res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
          orders
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFreelancerOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const orders = await OrderService.getFreelancerOrders(buyerId);
      res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
          orders
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
