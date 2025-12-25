import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { AnalyticsService } from './service';
import { sendSuccess } from '../../utils/response';

export class AnalyticsController {
  private service: AnalyticsService;

  constructor() {
    this.service = new AnalyticsService();
  }

  /**
   * GET /api/analytics/dashboard
   * Get comprehensive dashboard statistics
   */
  getDashboardStats = async (
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await this.service.getDashboardStats();
      sendSuccess(res, stats, 'Dashboard stats fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}

