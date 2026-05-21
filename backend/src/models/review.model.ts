import { query } from '../config/db';

export type ReviewCreator = 'BUYER' | 'FREELANCER';

export interface Review {
  order_id: string;
  descr: string | null;
  rating: number;
  created_by: ReviewCreator;
  created_at: Date;
}

export interface DetailedReview extends Review {
  creator_username: string;
}

export class ReviewModel {
  /**
   * Submit a review for an order.
   */
  static async create(data: Omit<Review, 'created_at'>): Promise<Review> {
    const sql = `
      INSERT INTO reviews (order_id, descr, rating, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING order_id, descr, rating, created_by, created_at;
    `;
    const params = [
      data.order_id,
      data.descr || null,
      data.rating,
      data.created_by
    ];
    const res = await query(sql, params);
    return res.rows[0];
  }

  /**
   * Find reviews submitted for a specific order.
   */
  static async findByOrderId(orderId: string): Promise<Review[]> {
    const sql = `
      SELECT order_id, descr, rating, created_by, created_at
      FROM reviews
      WHERE order_id = $1;
    `;
    const res = await query(sql, [orderId]);
    return res.rows;
  }

  /**
   * Fetch all reviews left by BUYERS for gigs under a specific gig.
   */
  static async findByGigId(gigId: string): Promise<DetailedReview[]> {
    const sql = `
      SELECT r.order_id, r.descr, r.rating, r.created_by, r.created_at,
             b.username as creator_username
      FROM reviews r
      JOIN orders o ON r.order_id = o.id
      JOIN packages p ON o.package_id = p.id
      JOIN buyers b ON o.buyer_id = b.id
      WHERE p.gig_id = $1 AND r.created_by = 'BUYER'
      ORDER BY r.created_at DESC;
    `;
    const res = await query(sql, [gigId]);
    return res.rows;
  }
}
