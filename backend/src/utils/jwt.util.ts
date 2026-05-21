import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: string; // BIGINT is returned as string in Node pg, so keep it as string
  email: string;
  username: string;
}

/**
 * Signs a JWT token containing user details.
 * @param payload Token payload
 * @returns JWT signed string
 */
export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any
  });
};

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param token JWT token string
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
