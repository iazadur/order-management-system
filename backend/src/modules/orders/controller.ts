import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { OrderService } from './service';
import { CreateOrderDto } from './dto';
import { sendSuccess, sendCreated } from '../../utils/response';

export class OrderController {
  private service: OrderService;

  constructor() {
    this.service = new OrderService();
  }

  /**
   * POST /api/orders
   * Create a new order (auth required)
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(new Error('User not authenticated'));
      }

      const data = req.body as CreateOrderDto;
      const order = await this.service.createOrder(userId, data);
      sendCreated(res, order, 'Order created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/orders
   * Get all orders (auth required, admin only)
   * TODO: Add admin check middleware
   */
  getAll = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await this.service.findAll();
      sendSuccess(res, orders);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/orders/:id
   * Get order by ID (auth required)
   */
  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return next(new Error('User not authenticated'));
      }

      const order = await this.service.getOrderById(id, userId);
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/orders/my
   * Get user's orders (auth required)
   */
  getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return next(new Error('User not authenticated'));
      }

      const orders = await this.service.getOrdersByUser(userId);
      sendSuccess(res, orders);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/orders/stats
   * Get order statistics (auth required, admin only)
   * TODO: Add admin check middleware
   */
  getStats = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  };
}
