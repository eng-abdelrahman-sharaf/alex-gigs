import { BuyerModel, Buyer } from '../models/buyer.model';
import { AppError } from '../middleware/error.middleware';

export class BuyerService {
  /**
   * Retrieve buyer profile by ID.
   */
  static async getProfile(id: string): Promise<Omit<Buyer, 'hashed_password'>> {
    const buyer = await BuyerModel.findById(id);
    if (!buyer) {
      throw new AppError(404, 'Buyer profile not found.');
    }
    const { hashed_password, ...buyerWithoutPassword } = buyer;
    return buyerWithoutPassword;
  }

  /**
   * Update buyer profile.
   */
  static async updateProfile(
    id: string,
    data: Partial<Pick<Buyer, 'fname' | 'lname' | 'overview' | 'country' | 'languages'>>
  ): Promise<Omit<Buyer, 'hashed_password'>> {
    const updated = await BuyerModel.updateProfile(id, data);
    if (!updated) {
      throw new AppError(404, 'Buyer profile not found.');
    }
    const { hashed_password, ...buyerWithoutPassword } = updated;
    return buyerWithoutPassword;
  }
}
