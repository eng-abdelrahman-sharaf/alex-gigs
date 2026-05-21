import { OrderModel, Order, DetailedOrder, OrderStatus } from '../models/order.model';
import { PackageModel } from '../models/package.model';
import { GigModel } from '../models/gig.model';
import { FreelancerModel } from '../models/freelancer.model';
import { AppError } from '../middleware/error.middleware';

export class OrderService {
  /**
   * Book/Create a new order for a package.
   */
  static async bookOrder(buyerId: string, packageId: string, paymentMethod: 'CARD', additionalDetails?: string): Promise<Order> {
    // 1. Fetch package
    const pkg = await PackageModel.findById(packageId);
    if (!pkg || !pkg.price) {
      throw new AppError(404, 'Package not found.');
    }

    // 2. Fetch gig to identify freelancer
    const gig = await GigModel.findById(pkg.gig_id);
    if (!gig) {
      throw new AppError(404, 'Gig associated with package not found.');
    }

    // 3. Ensure buyer isn't ordering their own gig
    if (gig.freelancer_buyer_id.toString() === buyerId) {
      throw new AppError(400, 'You cannot purchase your own gig.');
    }

    // 4. Create Order
    return await OrderModel.create({
      buyer_id: buyerId,
      package_id: packageId,
      payment_method: paymentMethod,
      price: pkg.price,
      additional_details: additionalDetails || null
    });
  }

  /**
   * Get complete order details.
   */
  static async getOrderDetails(userId: string, orderId: string): Promise<DetailedOrder> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    // Check if the requesting user is either the buyer or the freelancer
    if (order.buyer_id.toString() !== userId && order.freelancer_buyer_id.toString() !== userId) {
      throw new AppError(403, 'Access denied. You are not a participant in this order.');
    }

    return order;
  }

  /**
   * Update the status of an order (checks state-machine and participant rules).
   */
  static async updateOrderStatus(userId: string, orderId: string, newStatus: OrderStatus): Promise<Order> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Order not found.');
    }

    const isBuyer = order.buyer_id.toString() === userId;
    const isFreelancer = order.freelancer_buyer_id.toString() === userId;

    if (!isBuyer && !isFreelancer) {
      throw new AppError(403, 'Unauthorized.');
    }

    const currentStatus = order.status;

    // Check State Machine rules:
    switch (newStatus) {
      case 'IN_PROGRESS':
        // Freelancer accepts a PENDING order
        if (!isFreelancer) {
          throw new AppError(403, 'Only the freelancer can start the order.');
        }
        if (currentStatus !== 'PENDING') {
          throw new AppError(400, 'Only PENDING orders can be moved to IN_PROGRESS.');
        }
        break;

      case 'DELIVERED':
        // Freelancer delivers an IN_PROGRESS or CHANGES_REQUIRED order
        if (!isFreelancer) {
          throw new AppError(403, 'Only the freelancer can deliver work.');
        }
        if (currentStatus !== 'IN_PROGRESS' && currentStatus !== 'CHANGES_REQUIRED') {
          throw new AppError(400, 'Orders must be IN_PROGRESS or CHANGES_REQUIRED to be delivered.');
        }
        const delivered = await OrderModel.deliverOrder(orderId);
        if (!delivered) throw new AppError(400, 'Failed to deliver order.');
        return delivered;

      case 'COMPLETED':
        // Buyer completes a DELIVERED order
        if (!isBuyer) {
          throw new AppError(403, 'Only the buyer can complete the order.');
        }
        if (currentStatus !== 'DELIVERED') {
          throw new AppError(400, 'Only DELIVERED orders can be marked as COMPLETED.');
        }
        break;

      case 'CHANGES_REQUIRED':
        // Buyer requests changes on a DELIVERED order
        if (!isBuyer) {
          throw new AppError(403, 'Only the buyer can request changes.');
        }
        if (currentStatus !== 'DELIVERED') {
          throw new AppError(400, 'Changes can only be requested on DELIVERED orders.');
        }
        break;

      case 'CANCELLED':
        // Standard cancellation: PENDING can be cancelled by buyer/freelancer.
        // IN_PROGRESS can be cancelled by mutual agreement or according to dispute rules.
        if (currentStatus === 'DELIVERED' || currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
          throw new AppError(400, `Cannot cancel order in ${currentStatus} state.`);
        }
        break;

      default:
        throw new AppError(400, 'Invalid status transition.');
    }

    const updated = await OrderModel.updateStatus(orderId, newStatus);
    if (!updated) {
      throw new AppError(400, 'Failed to update order status.');
    }

    return updated;
  }

  /**
   * List all orders associated with a buyer.
   */
  static async getBuyerOrders(buyerId: string): Promise<DetailedOrder[]> {
    return await OrderModel.listBuyerOrders(buyerId);
  }

  /**
   * List all orders received by a freelancer.
   */
  static async getFreelancerOrders(buyerId: string): Promise<DetailedOrder[]> {
    const freelancer = await FreelancerModel.findByBuyerId(buyerId);
    if (!freelancer) {
      throw new AppError(404, 'Freelancer profile not found.');
    }
    return await OrderModel.listFreelancerOrders(freelancer.id);
  }
}
