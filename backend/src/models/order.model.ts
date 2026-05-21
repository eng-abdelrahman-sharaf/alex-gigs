import { query } from '../config/db';

export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'CHANGES_REQUIRED';
export type PaymentMethod = 'CARD';

export interface Order {
  id: string;
  buyer_id: string;
  package_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  price: string;
  additional_details: string | null;
  created_at: Date;
  delivered_at: Date | null;
}

export interface DetailedOrder extends Order {
  gig_title: string;
  package_title: string | null;
  package_type: string;
  buyer_username: string;
  freelancer_username: string;
  freelancer_id: string;
  freelancer_buyer_id: string;
}

export class OrderModel {
  /**
   * Create a new Order.
   */
  static async create(data: Omit<Order, 'id' | 'status' | 'created_at' | 'delivered_at'>): Promise<Order> {
    const sql = `
      INSERT INTO orders (buyer_id, package_id, payment_method, price, additional_details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, buyer_id, package_id, status, payment_method, price, additional_details, created_at, delivered_at;
    `;
    const params = [
      data.buyer_id,
      data.package_id,
      data.payment_method,
      data.price,
      data.additional_details || null
    ];
    const res = await query(sql, params);
    return res.rows[0];
  }

  /**
   * Find an order by its ID, complete with buyer, freelancer, and gig context details.
   */
  static async findById(id: string): Promise<DetailedOrder | null> {
    const sql = `
      SELECT o.id, o.buyer_id, o.package_id, o.status, o.payment_method, o.price, o.additional_details, o.created_at, o.delivered_at,
             g.title as gig_title, g.id as gig_id,
             p.title as package_title, p.type as package_type,
             b.username as buyer_username,
             fb.username as freelancer_username,
             f.id as freelancer_id,
             f.buyer_id as freelancer_buyer_id
      FROM orders o
      JOIN packages p ON o.package_id = p.id
      JOIN gigs g ON p.gig_id = g.id
      JOIN freelancers f ON g.freelancer_id = f.id
      JOIN buyers b ON o.buyer_id = b.id
      JOIN buyers fb ON f.buyer_id = fb.id
      WHERE o.id = $1;
    `;
    const res = await query(sql, [id]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Update the status of an order.
   */
  static async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const sql = `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING id, buyer_id, package_id, status, payment_method, price, additional_details, created_at, delivered_at;
    `;
    const res = await query(sql, [status, id]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Mark the order as delivered, setting the delivered_at timestamp.
   */
  static async deliverOrder(id: string): Promise<Order | null> {
    const sql = `
      UPDATE orders
      SET status = 'DELIVERED', delivered_at = NOW()
      WHERE id = $1
      RETURNING id, buyer_id, package_id, status, payment_method, price, additional_details, created_at, delivered_at;
    `;
    const res = await query(sql, [id]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * List all orders made by a buyer.
   */
  static async listBuyerOrders(buyerId: string): Promise<DetailedOrder[]> {
    const sql = `
      SELECT o.id, o.buyer_id, o.package_id, o.status, o.payment_method, o.price, o.additional_details, o.created_at, o.delivered_at,
             g.title as gig_title,
             p.title as package_title, p.type as package_type,
             b.username as buyer_username,
             fb.username as freelancer_username,
             f.id as freelancer_id,
             f.buyer_id as freelancer_buyer_id
      FROM orders o
      JOIN packages p ON o.package_id = p.id
      JOIN gigs g ON p.gig_id = g.id
      JOIN freelancers f ON g.freelancer_id = f.id
      JOIN buyers b ON o.buyer_id = b.id
      JOIN buyers fb ON f.buyer_id = fb.id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC;
    `;
    const res = await query(sql, [buyerId]);
    return res.rows;
  }

  /**
   * List all orders received by a freelancer.
   */
  static async listFreelancerOrders(freelancerId: string): Promise<DetailedOrder[]> {
    const sql = `
      SELECT o.id, o.buyer_id, o.package_id, o.status, o.payment_method, o.price, o.additional_details, o.created_at, o.delivered_at,
             g.title as gig_title,
             p.title as package_title, p.type as package_type,
             b.username as buyer_username,
             fb.username as freelancer_username,
             f.id as freelancer_id,
             f.buyer_id as freelancer_buyer_id
      FROM orders o
      JOIN packages p ON o.package_id = p.id
      JOIN gigs g ON p.gig_id = g.id
      JOIN freelancers f ON g.freelancer_id = f.id
      JOIN buyers b ON o.buyer_id = b.id
      JOIN buyers fb ON f.buyer_id = fb.id
      WHERE f.id = $1
      ORDER BY o.created_at DESC;
    `;
    const res = await query(sql, [freelancerId]);
    return res.rows;
  }
}
