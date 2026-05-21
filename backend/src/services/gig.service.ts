import { GigModel, Gig, FAQ, GigAnalytics } from '../models/gig.model';
import { PackageModel, GigPackage, PackageType } from '../models/package.model';
import { FreelancerModel } from '../models/freelancer.model';
import { AppError } from '../middleware/error.middleware';

export interface CreateGigInput {
  title: string;
  descr?: string;
  tags?: string[];
  portfolio?: string[];
  packages?: Array<{
    type: PackageType;
    title: string;
    descr: string;
    delivery_time: number;
    price: string;
    deliverables: string[];
  }>;
}

export class GigService {
  /**
   * Create a new gig with optional basic/standard/premium packages.
   */
  static async createGig(buyerId: string, input: CreateGigInput): Promise<Gig & { packages: GigPackage[] }> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(403, 'Only onboarded freelancers can create gigs.');
    }

    // 1. Create Gig
    const gig = await GigModel.create({
      freelancer_id: freelancer.id,
      title: input.title,
      descr: input.descr || null,
      tags: input.tags || null,
      portfolio: input.portfolio || null
    });

    // 2. Create Packages if provided
    const createdPackages: GigPackage[] = [];
    if (input.packages && input.packages.length > 0) {
      for (const pkg of input.packages) {
        const createdPkg = await PackageModel.create({
          gig_id: gig.id,
          type: pkg.type,
          title: pkg.title,
          descr: pkg.descr,
          delivery_time: pkg.delivery_time,
          price: pkg.price,
          deliverables: pkg.deliverables
        });
        createdPackages.push(createdPkg);
      }
    }

    return { ...gig, packages: createdPackages };
  }

  /**
   * Fetch a complete Gig including packages, FAQs, and seller info.
   */
  static async getGigDetails(id: string): Promise<any> {
    const gig = await GigModel.findById(id);
    if (!gig) {
      throw new AppError(404, 'Gig not found.');
    }

    const packages = await PackageModel.findByGigId(id);
    const faqs = await GigModel.getFaqs(id);
    const analytics = await GigModel.getAnalyticsByGigId(id);

    return {
      ...gig,
      packages,
      faqs,
      analytics: analytics || { gig_id: id, title: gig.title, avg_rating: 0, total_reviews: 0, total_lists: 0 }
    };
  }

  /**
   * Update Gig properties (verifying freelancer ownership).
   */
  static async updateGig(buyerId: string, gigId: string, data: Partial<Omit<Gig, 'id' | 'freelancer_id'>>): Promise<Gig> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(403, 'Unauthorized.');
    }

    const gig = await GigModel.findById(gigId);
    if (!gig) {
      throw new AppError(404, 'Gig not found.');
    }

    if (gig.freelancer_id !== freelancer.id) {
      throw new AppError(403, 'Unauthorized. You are not the owner of this gig.');
    }

    const updated = await GigModel.update(gigId, data);
    if (!updated) {
      throw new AppError(400, 'Failed to update gig.');
    }

    return updated;
  }

  /**
   * Delete Gig (verifying ownership).
   */
  static async deleteGig(buyerId: string, gigId: string): Promise<void> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(403, 'Unauthorized.');
    }

    const gig = await GigModel.findById(gigId);
    if (!gig) {
      throw new AppError(404, 'Gig not found.');
    }

    if (gig.freelancer_id !== freelancer.id) {
      throw new AppError(403, 'Unauthorized. You do not own this gig.');
    }

    await GigModel.delete(gigId);
  }

  /**
   * Search gigs with filters & pagination.
   */
  static async searchGigs(filters: { tag?: string; search?: string; limit?: number; offset?: number }): Promise<any[]> {
    return await GigModel.searchGigs(filters);
  }

  // ==========================================
  // SAVED GIG LISTS
  // ==========================================

  static async saveGig(buyerId: string, gigId: string): Promise<boolean> {
    const gig = await GigModel.findById(gigId);
    if (!gig) {
      throw new AppError(404, 'Gig not found.');
    }
    return await GigModel.saveToGigList(buyerId, gigId);
  }

  static async unsaveGig(buyerId: string, gigId: string): Promise<boolean> {
    return await GigModel.removeFromGigList(buyerId, gigId);
  }

  static async getSavedGigs(buyerId: string): Promise<any[]> {
    return await GigModel.getSavedGigs(buyerId);
  }

  // ==========================================
  // FAQs
  // ==========================================

  static async addFaq(buyerId: string, gigId: string, faqData: Omit<FAQ, 'gig_id'>): Promise<FAQ> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(403, 'Unauthorized.');
    }

    const gig = await GigModel.findById(gigId);
    if (!gig) {
      throw new AppError(404, 'Gig not found.');
    }

    if (gig.freelancer_id !== freelancer.id) {
      throw new AppError(403, 'Unauthorized. You do not own this gig.');
    }

    return await GigModel.upsertFaq({
      gig_id: gigId,
      question: faqData.question,
      answer: faqData.answer
    });
  }

  static async deleteFaq(buyerId: string, gigId: string, question: string): Promise<void> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(403, 'Unauthorized.');
    }

    const gig = await GigModel.findById(gigId);
    if (!gig) {
      throw new AppError(404, 'Gig not found.');
    }

    if (gig.freelancer_id !== freelancer.id) {
      throw new AppError(403, 'Unauthorized. You do not own this gig.');
    }

    const success = await GigModel.deleteFaq(gigId, question);
    if (!success) {
      throw new AppError(404, 'FAQ not found.');
    }
  }

  // ==========================================
  // PACKAGES
  // ==========================================

  static async addPackage(
    buyerId: string,
    gigId: string,
    pkgData: Omit<GigPackage, 'id' | 'gig_id'>
  ): Promise<GigPackage> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(403, 'Unauthorized.');
    }

    const gig = await GigModel.findById(gigId);
    if (!gig) {
      throw new AppError(404, 'Gig not found.');
    }

    if (gig.freelancer_id !== freelancer.id) {
      throw new AppError(403, 'Unauthorized. You do not own this gig.');
    }

    // Check if package type already exists for this gig
    const packages = await PackageModel.findByGigId(gigId);
    if (packages.some((p) => p.type === pkgData.type)) {
      throw new AppError(409, `A package of type ${pkgData.type} already exists for this gig.`);
    }

    return await PackageModel.create({
      gig_id: gigId,
      type: pkgData.type,
      title: pkgData.title,
      descr: pkgData.descr,
      delivery_time: pkgData.delivery_time,
      price: pkgData.price,
      deliverables: pkgData.deliverables
    });
  }

  static async updatePackage(
    buyerId: string,
    packageId: string,
    pkgData: Partial<Omit<GigPackage, 'id' | 'gig_id' | 'type'>>
  ): Promise<GigPackage> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(403, 'Unauthorized.');
    }

    const pkg = await PackageModel.findById(packageId);
    if (!pkg) {
      throw new AppError(404, 'Package not found.');
    }

    const gig = await GigModel.findById(pkg.gig_id);
    if (!gig || gig.freelancer_id !== freelancer.id) {
      throw new AppError(403, 'Unauthorized.');
    }

    const updated = await PackageModel.update(packageId, pkgData);
    if (!updated) {
      throw new AppError(400, 'Failed to update package.');
    }

    return updated;
  }
}
