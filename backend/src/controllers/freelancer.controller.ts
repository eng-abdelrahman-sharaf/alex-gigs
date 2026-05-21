import { Request, Response, NextFunction } from 'express';
import { FreelancerService } from '../services/freelancer.service';
import { AppError } from '../middleware/error.middleware';

export class FreelancerController {
  static async onboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const freelancer = await FreelancerService.onboard(buyerId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Onboarded as freelancer successfully',
        data: {
          freelancer
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOwnProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const profile = await FreelancerService.getProfileByBuyerId(buyerId);
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

  static async getFreelancerProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await FreelancerService.getProfileById(id);
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
      const buyerId = req.user?.id;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const profile = await FreelancerService.updateProfile(buyerId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Freelancer profile updated successfully',
        data: {
          profile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async setAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const availability = await FreelancerService.setAvailability(buyerId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Availability schedule set successfully',
        data: {
          availability
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
