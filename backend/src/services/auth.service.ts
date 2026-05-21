import { BuyerModel, Buyer } from '../models/buyer.model';
import { hashPassword, comparePassword } from '../utils/hash.util';
import { signToken } from '../utils/jwt.util';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  /**
   * Register a new buyer.
   */
  static async register(data: Omit<Buyer, 'id' | 'created_at'> & { password?: string }): Promise<{ token: string; user: Omit<Buyer, 'hashed_password'> }> {
    // Check if email already registered
    const existingEmail = await BuyerModel.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError(409, 'Email is already registered.');
    }

    // Check if username already taken
    const existingUsername = await BuyerModel.findByUsername(data.username);
    if (existingUsername) {
      throw new AppError(409, 'Username is already taken.');
    }

    // Hash password with salt & pepper
    const hashedPassword = await hashPassword(data.hashed_password || '');

    // Save buyer to DB
    const buyer = await BuyerModel.create({
      username: data.username,
      email: data.email,
      hashed_password: hashedPassword,
      fname: data.fname,
      lname: data.lname,
      overview: data.overview,
      country: data.country,
      languages: data.languages
    });

    // Generate JWT token
    const token = signToken({
      id: buyer.id,
      email: buyer.email,
      username: buyer.username
    });

    const { hashed_password, ...userWithoutPassword } = buyer;

    return { token, user: userWithoutPassword };
  }

  /**
   * Authenticate a buyer and issue a JWT.
   */
  static async login(identifier: string, password: string): Promise<{ token: string; user: Omit<Buyer, 'hashed_password'> }> {
    // Identifier can be email or username
    let buyer = await BuyerModel.findByEmail(identifier);
    if (!buyer) {
      buyer = await BuyerModel.findByUsername(identifier);
    }

    if (!buyer || !buyer.hashed_password) {
      throw new AppError(401, 'Invalid email/username or password.');
    }

    // Compare password (hashes with secret pepper internally)
    const isPasswordValid = await comparePassword(password, buyer.hashed_password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email/username or password.');
    }

    // Generate JWT token
    const token = signToken({
      id: buyer.id,
      email: buyer.email,
      username: buyer.username
    });

    const { hashed_password, ...userWithoutPassword } = buyer;

    return { token, user: userWithoutPassword };
  }
}
