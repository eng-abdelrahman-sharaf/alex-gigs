import { FreelancerModel, Freelancer, Availability } from '../models/freelancer.model';
import { AppError } from '../middleware/error.middleware';

export class FreelancerService {
  /**
   * Onboard a buyer as a freelancer.
   */
  static async onboard(buyerId: string, data: { job_title?: string; overview?: string }): Promise<Freelancer> {
    const existing = await FreelancerModel.findByBuyerId(buyerId);
    if (existing) {
      throw new AppError(409, 'User is already onboarded as a Freelancer.');
    }

    return await FreelancerModel.create({
      buyer_id: buyerId,
      job_title: data.job_title,
      overview: data.overview
    });
  }

  /**
   * Retrieve freelancer profile.
   */
  static async getProfileByBuyerId(buyerId: string): Promise<Freelancer & { availability: Availability | null }> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(404, 'Freelancer profile not found for this user.');
    }

    const availability = await FreelancerModel.getAvailability(freelancer.id);
    return { ...freelancer, availability };
  }

  /**
   * Retrieve freelancer profile by freelancer ID.
   */
  static async getProfileById(id: string): Promise<Freelancer & { availability: Availability | null }> {
    const freelancer = await FreelancerModel.findById(id);
    if (!freelancer) {
      throw new AppError(404, 'Freelancer profile not found.');
    }

    const availability = await FreelancerModel.getAvailability(freelancer.id);
    return { ...freelancer, availability };
  }

  /**
   * Update freelancer professional bio/title.
   */
  static async updateProfile(
    buyerId: string,
    data: Partial<Pick<Freelancer, 'job_title' | 'overview'>>
  ): Promise<Freelancer> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(404, 'Freelancer profile not found.');
    }

    const updated = await FreelancerModel.updateProfile(freelancer.id, data);
    if (!updated) {
      throw new AppError(400, 'Failed to update freelancer profile.');
    }

    return updated;
  }

  /**
   * Update or insert freelancer availability schedule.
   */
  static async setAvailability(buyerId: string, data: Omit<Availability, 'freelancer_id'>): Promise<Availability> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(404, 'Freelancer profile not found. Onboard first.');
    }

    return await FreelancerModel.upsertAvailability({
      freelancer_id: freelancer.id,
      start_day: data.start_day,
      end_day: data.end_day,
      start_hour: data.start_hour,
      end_hour: data.end_hour
    });
  }
}
