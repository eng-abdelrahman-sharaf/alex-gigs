import { query } from '../config/db';

export interface Buyer {
  id: string;
  username: string;
  email: string;
  hashed_password?: string;
  fname: string | null;
  lname: string | null;
  overview: string | null;
  country: string | null;
  languages: string[] | null;
  created_at: Date;
}

export class BuyerModel {
  /**
   * Create a new buyer in the database.
   */
  static async create(data: Omit<Buyer, 'id' | 'created_at'>): Promise<Buyer> {
    const sql = `
      INSERT INTO buyers (username, email, hashed_password, fname, lname, overview, country, languages)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, email, fname, lname, overview, country, languages, created_at;
    `;
    const params = [
      data.username,
      data.email,
      data.hashed_password,
      data.fname,
      data.lname,
      data.overview,
      data.country,
      data.languages
    ];
    const res = await query(sql, params);
    return res.rows[0];
  }

  /**
   * Find a buyer by their ID.
   */
  static async findById(id: string): Promise<Buyer | null> {
    const sql = `
      SELECT id, username, email, hashed_password, fname, lname, overview, country, languages, created_at
      FROM buyers
      WHERE id = $1;
    `;
    const res = await query(sql, [id]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Find a buyer by their email.
   */
  static async findByEmail(email: string): Promise<Buyer | null> {
    const sql = `
      SELECT id, username, email, hashed_password, fname, lname, overview, country, languages, created_at
      FROM buyers
      WHERE email = $1;
    `;
    const res = await query(sql, [email]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Find a buyer by their username.
   */
  static async findByUsername(username: string): Promise<Buyer | null> {
    const sql = `
      SELECT id, username, email, hashed_password, fname, lname, overview, country, languages, created_at
      FROM buyers
      WHERE username = $1;
    `;
    const res = await query(sql, [username]);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }

  /**
   * Update a buyer's profile details.
   */
  static async updateProfile(
    id: string,
    data: Partial<Pick<Buyer, 'fname' | 'lname' | 'overview' | 'country' | 'languages'>>
  ): Promise<Buyer | null> {
    // Dynamically build SET query
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
      UPDATE buyers
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, username, email, fname, lname, overview, country, languages, created_at;
    `;

    const res = await query(sql, values);
    return res.rowCount && res.rowCount > 0 ? res.rows[0] : null;
  }
}
