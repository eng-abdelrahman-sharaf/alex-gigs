import { query } from '../config/db';

export type PackageType = 'BASIC' | 'STANDARD' | 'PREMIUM';

export interface GigPackage {
  id: string;
  gig_id: string;
  type: PackageType;
  title: string | null;
  descr: string | null;
  delivery_time: number | null;
  price: string | null; // Database returns NUMERIC as string to preserve precision
  deliverables: string[] | null;
}

export class PackageModel {
  /**
   * Create a new Package for a gig.
   */
  static async create(data: Omit<GigPackage, 'id'>): Promise<GigPackage> {
    const sql = `
      INSERT INTO packages (gig_id, type, title, descr, delivery_time, price, deliverables)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, gig_id, type, title, descr, delivery_time, price, deliverables;
    `;
    const params = [
      data.gig_id,
      data.type,
      data.title || null,
      data.descr || null,
      data.delivery_time || null,
      data.price || null,
      data.deliverables || null
    ];
    const res = await query(sql, params);
    return res.rows[0];
  }

  /**
   * Find a package by its unique ID.
   */
  static async findById(id: string): Promise<GigPackage | null> {
    const sql = `
      SELECT id, gig_id, type, title, descr, delivery_time, price, deliverables
      FROM packages
      WHERE id = $1;
    `;
    const res = await query(sql, [id]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Find all packages associated with a specific gig.
   */
  static async findByGigId(gigId: string): Promise<GigPackage[]> {
    const sql = `
      SELECT id, gig_id, type, title, descr, delivery_time, price, deliverables
      FROM packages
      WHERE gig_id = $1
      ORDER BY CASE type
        WHEN 'BASIC' THEN 1
        WHEN 'STANDARD' THEN 2
        WHEN 'PREMIUM' THEN 3
        ELSE 4
      END;
    `;
    const res = await query(sql, [gigId]);
    return res.rows;
  }

  /**
   * Update a package.
   */
  static async update(id: string, data: Partial<Omit<GigPackage, 'id' | 'gig_id' | 'type'>>): Promise<GigPackage | null> {
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
      UPDATE packages
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, gig_id, type, title, descr, delivery_time, price, deliverables;
    `;

    const res = await query(sql, values);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Delete a package from database.
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM packages WHERE id = $1;';
    const res = await query(sql, [id]);
    return (res.rowCount && res.rowCount > 0) || false;
  }
}
