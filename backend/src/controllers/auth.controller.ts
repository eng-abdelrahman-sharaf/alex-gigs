import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const result = await AuthService.login(identifier, password);
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.user is attached by requireAuth middleware
      res.status(200).json({
        status: 'success',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
