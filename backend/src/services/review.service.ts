import { ReviewModel, Review, DetailedReview, ReviewCreator } from '../models/review.model';
import { OrderModel } from '../models/order.model';
import { AppError } from '../middleware/error.middleware';

export class ReviewService {
  /**
   * Submit a review for a completed order.
   */
  static async submitReview(
    userId: string,
    data: { order_id: string; descr?: string; rating: number; created_by: ReviewCreator }
  ): Promise<Review> {
    // 1. Fetch the order
    const order = await OrderModel.findById(data.order_id);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    // 2. Order must be completed to be reviewed
    if (order.status !== 'COMPLETED') {
      throw new AppError(400, 'Only completed orders can be reviewed.');
    }

    // 3. Verify role authorization
    if (data.created_by === 'BUYER') {
      if (order.buyer_id.toString() !== userId) {
        throw new AppError(403, 'Only the buyer of this order can submit a buyer review.');
      }
    } else if (data.created_by === 'FREELANCER') {
      if (order.freelancer_buyer_id.toString() !== userId) {
        throw new AppError(403, 'Only the freelancer of this order can submit a freelancer review.');
      }
    } else {
      throw new AppError(400, 'Invalid review creator type.');
    }

    // 4. Verify rating bounds
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError(400, 'Rating must be between 1 and 5.');
    }

    // 5. Check if review already exists
    const existingReviews = await ReviewModel.findByOrderId(data.order_id);
    if (existingReviews.some((r) => r.created_by === data.created_by)) {
      throw new AppError(409, `You have already submitted a review as ${data.created_by} for this order.`);
    }

    // 6. Create review
    return await ReviewModel.create({
      order_id: data.order_id,
      descr: data.descr || null,
      rating: data.rating,
      created_by: data.created_by
    });
  }

  /**
   * Fetch reviews submitted for a specific order.
   */
  static async getOrderReviews(orderId: string): Promise<Review[]> {
    return await ReviewModel.findByOrderId(orderId);
  }

  /**
   * Fetch reviews left by BUYERS for a specific gig.
   */
  static async getGigReviews(gigId: string): Promise<DetailedReview[]> {
    return await ReviewModel.findByGigId(gigId);
  }
}
