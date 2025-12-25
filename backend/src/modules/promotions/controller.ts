import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { PromotionService } from './service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  TogglePromotionDto,
} from './dto';
import { sendSuccess, sendCreated } from '../../utils/response';

export class PromotionController {
  private service: PromotionService;

  constructor() {
    this.service = new PromotionService();
  }

  /**
   * GET /api/promotions
   * Get all promotions (auth required)
   */
  getAll = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const promotions = await this.service.getAllPromotions();
      sendSuccess(res, promotions);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/promotions/active
   * Get active promotions (public endpoint)
   */
  getActive = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const promotions = await this.service.getActivePromotions();
      sendSuccess(res, promotions);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/promotions/:id
   * Get promotion by ID (auth required)
   */
  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const promotion = await this.service.getPromotionById(id);
      sendSuccess(res, promotion);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/promotions
   * Create a new promotion (auth required)
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body as CreatePromotionDto;
      const promotion = await this.service.createPromotion(data);
      sendCreated(res, promotion, 'Promotion created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/promotions/:id
   * Update promotion (limited fields only) (auth required)
   */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as UpdatePromotionDto;
      const promotion = await this.service.updatePromotion(id, data);
      sendSuccess(res, promotion, 'Promotion updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/promotions/:id/toggle
   * Toggle promotion enabled/disabled status (auth required)
   */
  toggle = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as TogglePromotionDto;
      const promotion = await this.service.togglePromotion(id, data);
      sendSuccess(
        res,
        promotion,
        `Promotion ${data.isEnabled ? 'enabled' : 'disabled'} successfully`
      );
    } catch (error) {
      next(error);
    }
  };
}
