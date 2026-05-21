import { Request, Response, NextFunction } from 'express';
import { BuyerService } from '../services/buyer.service';
import { AppError } from '../middleware/error.middleware';

export class BuyerController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const profile = await BuyerService.getProfile(userId);
      res.status(200).json({
        status: 'success',
        data: {
          profile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const profile = await BuyerService.updateProfile(userId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          profile
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
