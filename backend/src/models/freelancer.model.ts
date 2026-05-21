import { query } from '../config/db';

export interface Freelancer {
  id: string;
  buyer_id: string;
  job_title: string | null;
  overview: string | null;
}

export interface Availability {
  freelancer_id: string;
  start_day: string | null;
  end_day: string | null;
  start_hour: string | null; // Database type TIME is returned as formatted string "HH:MM:SS" or "HH:MM"
  end_hour: string | null;
}

export class FreelancerModel {
  /**
   * Register a buyer as a freelancer.
   */
  static async create(data: { buyer_id: string; job_title?: string; overview?: string }): Promise<Freelancer> {
    const sql = `
      INSERT INTO freelancers (buyer_id, job_title, overview)
      VALUES ($1, $2, $3)
      RETURNING id, buyer_id, job_title, overview;
    `;
    const res = await query(sql, [data.buyer_id, data.job_title || null, data.overview || null]);
    return res.rows[0];
  }

  /**
   * Find freelancer profile by their buyer ID.
   */
  static async findByBuyerId(buyerId: string): Promise<Freelancer | null> {
    const sql = `
      SELECT id, buyer_id, job_title, overview
      FROM freelancers
      WHERE buyer_id = $1;
    `;
    const res = await query(sql, [buyerId]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Find freelancer profile by freelancer ID.
   */
  static async findById(id: string): Promise<Freelancer | null> {
    const sql = `
      SELECT id, buyer_id, job_title, overview
      FROM freelancers
      WHERE id = $1;
    `;
    const res = await query(sql, [id]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Update freelancer professional profile.
   */
  static async updateProfile(
    id: string,
    data: Partial<Pick<Freelancer, 'job_title' | 'overview'>>
  ): Promise<Freelancer | null> {
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
      return this.findById(id);
    }

    values.push(id);
    const sql = `
      UPDATE freelancers
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, buyer_id, job_title, overview;
    `;

    const res = await query(sql, values);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Add or update availability parameters.
   */
  static async upsertAvailability(data: Availability): Promise<Availability> {
    const sql = `
      INSERT INTO availabilities (freelancer_id, start_day, end_day, start_hour, end_hour)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (freelancer_id)
      DO UPDATE SET
        start_day = EXCLUDED.start_day,
        end_day = EXCLUDED.end_day,
        start_hour = EXCLUDED.start_hour,
        end_hour = EXCLUDED.end_hour
      RETURNING freelancer_id, start_day, end_day, start_hour, end_hour;
    `;
    const params = [
      data.freelancer_id,
      data.start_day,
      data.end_day,
      data.start_hour,
      data.end_hour
    ];
    const res = await query(sql, params);
    return res.rows[0];
  }

  /**
   * Get availability schedule for a freelancer.
   */
  static async getAvailability(freelancerId: string): Promise<Availability | null> {
    const sql = `
      SELECT freelancer_id, start_day, end_day, start_hour, end_hour
      FROM availabilities
      WHERE freelancer_id = $1;
    `;
    const res = await query(sql, [freelancerId]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }
}
