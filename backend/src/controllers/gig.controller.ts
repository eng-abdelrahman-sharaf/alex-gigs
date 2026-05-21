import { Request, Response, NextFunction } from 'express';
import { GigService } from '../services/gig.service';
import { AppError } from '../middleware/error.middleware';

export class GigController {
  static async createGig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const gig = await GigService.createGig(buyerId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Gig created successfully',
        data: {
          gig
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getGigDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const gig = await GigService.getGigDetails(id);
      res.status(200).json({
        status: 'success',
        data: {
          gig
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateGig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      const { id } = req.params;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const gig = await GigService.updateGig(buyerId, id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Gig details updated successfully',
        data: {
          gig
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteGig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      const { id } = req.params;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      await GigService.deleteGig(buyerId, id);
      res.status(200).json({
        status: 'success',
        message: 'Gig deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchGigs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gigs = await GigService.searchGigs({
        tag: req.query.tag as string,
        search: req.query.search as string,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined
      });
      res.status(200).json({
        status: 'success',
        results: gigs.length,
        data: {
          gigs
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // SAVED LISTS
  // ==========================================

  static async saveGig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      const { id } = req.params;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      await GigService.saveGig(buyerId, id);
      res.status(200).json({
        status: 'success',
        message: 'Gig saved to list successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async unsaveGig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      const { id } = req.params;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      await GigService.unsaveGig(buyerId, id);
      res.status(200).json({
        status: 'success',
        message: 'Gig removed from list successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSavedGigs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const gigs = await GigService.getSavedGigs(buyerId);
      res.status(200).json({
        status: 'success',
        results: gigs.length,
        data: {
          gigs
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // FAQs
  // ==========================================

  static async addFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      const { id } = req.params;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const faq = await GigService.addFaq(buyerId, id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'FAQ added/updated successfully',
        data: {
          faq
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      const { id } = req.params;
      const { question } = req.query;
      if (!buyerId) throw new AppError(401, 'Unauthorized');
      if (!question) throw new AppError(400, 'question query parameter is required');

      await GigService.deleteFaq(buyerId, id, question as string);
      res.status(200).json({
        status: 'success',
        message: 'FAQ deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PACKAGES
  // ==========================================

  static async addPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      const { id } = req.params;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const pkg = await GigService.addPackage(buyerId, id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Package added successfully',
        data: {
          package: pkg
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id;
      const { packageId } = req.params;
      if (!buyerId) throw new AppError(401, 'Unauthorized');

      const pkg = await GigService.updatePackage(buyerId, packageId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Package updated successfully',
        data: {
          package: pkg
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
