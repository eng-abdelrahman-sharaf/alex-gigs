import { query } from '../config/db';

export interface Gig {
  id: string;
  freelancer_id: string;
  title: string;
  descr: string | null;
  tags: string[] | null;
  portfolio: string[] | null;
}

export interface FAQ {
  gig_id: string;
  question: string;
  answer: string;
}

export interface GigAnalytics {
  gig_id: string;
  title: string;
  avg_rating: number;
  total_reviews: number;
  total_lists: number;
}

export class GigModel {
  /**
   * Create a new Gig in the database.
   */
  static async create(data: Omit<Gig, 'id'>): Promise<Gig> {
    const sql = `
      INSERT INTO gigs (freelancer_id, title, descr, tags, portfolio)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, freelancer_id, title, descr, tags, portfolio;
    `;
    const params = [
      data.freelancer_id,
      data.title,
      data.descr || null,
      data.tags || null,
      data.portfolio || null
    ];
    const res = await query(sql, params);
    return res.rows[0];
  }

  /**
   * Find a gig by its ID, attaching freelancer and buyer username.
   */
  static async findById(id: string): Promise<(Gig & { freelancer_name: string; freelancer_title: string | null; freelancer_buyer_id: string }) | null> {
    const sql = `
      SELECT g.id, g.freelancer_id, g.title, g.descr, g.tags, g.portfolio,
             b.username as freelancer_name, f.job_title as freelancer_title, f.buyer_id as freelancer_buyer_id
      FROM gigs g
      JOIN freelancers f ON g.freelancer_id = f.id
      JOIN buyers b ON f.buyer_id = b.id
      WHERE g.id = $1;
    `;
    const res = await query(sql, [id]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Update a gig's core properties.
   */
  static async update(id: string, data: Partial<Omit<Gig, 'id' | 'freelancer_id'>>): Promise<Gig | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    });

    if (fields.length === 0) {
      const current = await this.findById(id);
      return current ? { id: current.id, freelancer_id: current.freelancer_id, title: current.title, descr: current.descr, tags: current.tags, portfolio: current.portfolio } : null;
    }

    values.push(id);
    const sql = `
      UPDATE gigs
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, freelancer_id, title, descr, tags, portfolio;
    `;

    const res = await query(sql, values);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Delete a gig from the database.
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM gigs WHERE id = $1;';
    const res = await query(sql, [id]);
    return (res.rowCount && res.rowCount > 0) || false;
  }

  /**
   * Search/List gigs with filters and pagination.
   */
  static async searchGigs(filters: {
    tag?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Array<Gig & { freelancer_name: string; avg_rating: number; total_reviews: number }>> {
    const values: any[] = [];
    let idx = 1;
    const conditions: string[] = [];

    if (filters.tag) {
      conditions.push(`$${idx} = ANY(g.tags)`);
      values.push(filters.tag);
      idx++;
    }

    if (filters.search) {
      conditions.push(`(g.title ILIKE $${idx} OR g.descr ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    values.push(limit, offset);
    const limitIdx = idx;
    const offsetIdx = idx + 1;

    const sql = `
      SELECT g.id, g.freelancer_id, g.title, g.descr, g.tags, g.portfolio,
             b.username as freelancer_name,
             COALESCE(ga.avg_rating, 0) as avg_rating,
             COALESCE(ga.total_reviews, 0) as total_reviews
      FROM gigs g
      JOIN freelancers f ON g.freelancer_id = f.id
      JOIN buyers b ON f.buyer_id = b.id
      LEFT JOIN gig_analytics ga ON ga.gig_id = g.id
      ${whereClause}
      ORDER BY ga.avg_rating DESC, g.id DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const res = await query(sql, values);
    return res.rows;
  }

  // ==========================================
  // GIG LISTS (Saved Gigs)
  // ==========================================

  static async saveToGigList(buyerId: string, gigId: string): Promise<boolean> {
    const sql = `
      INSERT INTO gig_lists (buyer_id, gig_id)
      VALUES ($1, $2)
      ON CONFLICT (buyer_id, gig_id) DO NOTHING;
    `;
    const res = await query(sql, [buyerId, gigId]);
    return (res.rowCount && res.rowCount > 0) || false;
  }

  static async removeFromGigList(buyerId: string, gigId: string): Promise<boolean> {
    const sql = `
      DELETE FROM gig_lists
      WHERE buyer_id = $1 AND gig_id = $2;
    `;
    const res = await query(sql, [buyerId, gigId]);
    return (res.rowCount && res.rowCount > 0) || false;
  }

  static async isSaved(buyerId: string, gigId: string): Promise<boolean> {
    const sql = `
      SELECT 1 FROM gig_lists
      WHERE buyer_id = $1 AND gig_id = $2;
    `;
    const res = await query(sql, [buyerId, gigId]);
    return (res.rowCount && res.rowCount > 0) || false;
  }

  static async getSavedGigs(buyerId: string): Promise<Array<Gig & { freelancer_name: string }>> {
    const sql = `
      SELECT g.id, g.freelancer_id, g.title, g.descr, g.tags, g.portfolio,
             b.username as freelancer_name
      FROM gig_lists gl
      JOIN gigs g ON gl.gig_id = g.id
      JOIN freelancers f ON g.freelancer_id = f.id
      JOIN buyers b ON f.buyer_id = b.id
      WHERE gl.buyer_id = $1
      ORDER BY gl.created_at DESC;
    `;
    const res = await query(sql, [buyerId]);
    return res.rows;
  }

  // ==========================================
  // FAQs
  // ==========================================

  static async upsertFaq(data: FAQ): Promise<FAQ> {
    const sql = `
      INSERT INTO faqs (gig_id, question, answer)
      VALUES ($1, $2, $3)
      ON CONFLICT (gig_id, question)
      DO UPDATE SET answer = EXCLUDED.answer
      RETURNING gig_id, question, answer;
    `;
    const res = await query(sql, [data.gig_id, data.question, data.answer]);
    return res.rows[0];
  }

  static async deleteFaq(gigId: string, question: string): Promise<boolean> {
    const sql = `
      DELETE FROM faqs
      WHERE gig_id = $1 AND question = $2;
    `;
    const res = await query(sql, [gigId, question]);
    return (res.rowCount && res.rowCount > 0) || false;
  }

  static async getFaqs(gigId: string): Promise<FAQ[]> {
    const sql = `
      SELECT gig_id, question, answer
      FROM faqs
      WHERE gig_id = $1;
    `;
    const res = await query(sql, [gigId]);
    return res.rows;
  }

  // ==========================================
  // VIEW: GIG ANALYTICS
  // ==========================================

  static async getAnalyticsByGigId(gigId: string): Promise<GigAnalytics | null> {
    const sql = `
      SELECT gig_id, title, avg_rating, total_reviews, total_lists
      FROM gig_analytics
      WHERE gig_id = $1;
    `;
    const res = await query(sql, [gigId]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }
}
