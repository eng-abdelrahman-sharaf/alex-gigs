import bcrypt from 'bcrypt';
import { env } from '../config/env';

const SALT_ROUNDS = 12;

/**
 * Hashes a plain text password using bcrypt combined with a system-wide secret pepper.
 * @param password Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const passwordWithPepper = password + env.DB_PEPPER;
  return await bcrypt.hash(passwordWithPepper, SALT_ROUNDS);
};

/**
 * Compares a plain text password with a hash using bcrypt combined with the system pepper.
 * @param password Plain text password
 * @param hash Hashed password to compare against
 * @returns Boolean representing if password matches
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordWithPepper = password + env.DB_PEPPER;
  return await bcrypt.compare(passwordWithPepper, hash);
};
