import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { AppError } from '../middleware/error.middleware';

export class ReviewController {
  static async submitReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const review = await ReviewService.submitReview(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Review submitted successfully',
        data: {
          review
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getGigReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gigId } = req.params;
      const reviews = await ReviewService.getGigReviews(gigId);
      res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
          reviews
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const reviews = await ReviewService.getOrderReviews(orderId);
      res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
          reviews
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
