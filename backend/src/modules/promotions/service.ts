import { PromotionRepository, PromotionWithSlabs } from './repository';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  TogglePromotionDto,
  CreateSlabDto,
} from './dto';
import { NotFoundError, BadRequestError, ValidationError } from '../../utils/errors';
import { validateSlabRanges } from './discountEngine';
import { Product } from '@prisma/client';

export class PromotionService {
  private repository: PromotionRepository;

  constructor() {
    this.repository = new PromotionRepository();
  }

  /**
   * Get active promotions (enabled & within date range)
   */
  async getActivePromotions(): Promise<PromotionWithSlabs[]> {
    return this.repository.findActive();
  }

  /**
   * Get all promotions with slabs
   */
  async getAllPromotions(): Promise<PromotionWithSlabs[]> {
    return this.repository.findAllWithSlabs();
  }

  /**
   * Get promotion by ID
   */
  async getPromotionById(id: string, includeSlabs: boolean = true): Promise<PromotionWithSlabs> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestError('Invalid promotion ID format');
    }

    const promotion = await this.repository.findById(id, includeSlabs);

    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    return promotion;
  }

  /**
   * Create a new promotion
   */
  async createPromotion(data: CreatePromotionDto): Promise<PromotionWithSlabs> {
    // Validate date range
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (start >= end) {
        throw new BadRequestError('Start date must be before end date');
      }
    }

    // Validate slabs for weighted promotions
    if (data.type === 'WEIGHTED' && data.slabs) {
      // Validate slab ranges don't overlap
      try {
        validateSlabRanges(data.slabs);
      } catch (error) {
        throw new ValidationError(
          error instanceof Error ? error.message : 'Invalid slab ranges'
        );
      }

      // Validate slabs are sorted and non-overlapping
      const sortedSlabs = [...data.slabs].sort((a, b) => a.minWeight - b.minWeight);
      for (let i = 0; i < sortedSlabs.length - 1; i++) {
        if (sortedSlabs[i].maxWeight >= sortedSlabs[i + 1].minWeight) {
          throw new ValidationError(
            `Slab ranges overlap: [${sortedSlabs[i].minWeight}-${sortedSlabs[i].maxWeight}] overlaps with [${sortedSlabs[i + 1].minWeight}-${sortedSlabs[i + 1].maxWeight}]`
          );
        }
      }
    }

    // Prepare promotion data
    let description = `TYPE:${data.type}`;

    // Store discount values in description for PERCENTAGE and FIXED
    if (data.type === 'PERCENTAGE' && data.percentageValue) {
      description += `,PERCENTAGE:${data.percentageValue}`;
    }
    if (data.type === 'FIXED' && data.fixedValue) {
      description += `,FIXED:${data.fixedValue}`;
    }

    const promotionData: any = {
      name: data.title,
      startsAt: data.startDate ? new Date(data.startDate) : null,
      endsAt: data.endDate ? new Date(data.endDate) : null,
      isActive: data.isEnabled,
      description,
    };

    // Create promotion with slabs
    if (data.type === 'WEIGHTED' && data.slabs) {
      // For WEIGHTED: use provided slabs
      return this.repository.create(promotionData, data.slabs);
    } else if (data.type === 'PERCENTAGE' && data.percentageValue) {
      // For PERCENTAGE: create a slab with PERCENTAGE_DISCOUNT type
      return this.repository.create(promotionData, [{
        minWeight: 0,
        maxWeight: Infinity,
        discountPerUnit: data.percentageValue,
      }], 'PERCENTAGE_DISCOUNT');
    } else if (data.type === 'FIXED' && data.fixedValue) {
      // For FIXED: create a slab with FIXED_AMOUNT_DISCOUNT type
      return this.repository.create(promotionData, [{
        minWeight: 0,
        maxWeight: Infinity,
        discountPerUnit: data.fixedValue,
      }], 'FIXED_AMOUNT_DISCOUNT');
    }

    return this.repository.create(promotionData);
  }

  /**
   * Update promotion (only title, startDate, endDate allowed)
   */
  async updatePromotion(id: string, data: UpdatePromotionDto): Promise<PromotionWithSlabs> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestError('Invalid promotion ID format');
    }

    // Check if promotion exists
    const promotion = await this.repository.findById(id, false);
    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    // Validate date range
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (start >= end) {
        throw new BadRequestError('Start date must be before end date');
      }
    }

    const updateData: any = {};

    if (data.title !== undefined) {
      updateData.name = data.title;
    }

    if (data.startDate !== undefined) {
      updateData.startsAt = data.startDate ? new Date(data.startDate) : null;
    }

    if (data.endDate !== undefined) {
      updateData.endsAt = data.endDate ? new Date(data.endDate) : null;
    }

    return this.repository.update(id, updateData);
  }

  /**
   * Toggle promotion enabled/disabled status
   */
  async togglePromotion(id: string, data: TogglePromotionDto): Promise<PromotionWithSlabs> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestError('Invalid promotion ID format');
    }

    const promotion = await this.repository.findById(id, false);
    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    // If already in desired state, return early
    if (promotion.isActive === data.isEnabled) {
      return this.repository.findById(id, true) as Promise<PromotionWithSlabs>;
    }

    return this.repository.toggleEnabled(id, data.isEnabled);
  }

  /**
   * Calculate discount for a product using a promotion
   */
  async calculateDiscount(
    promotionId: string,
    product: Product & { weight: number },
    quantity: number
  ): Promise<{ discount: number; applied: boolean; reason?: string }> {
    if (!this.isValidUUID(promotionId)) {
      throw new BadRequestError('Invalid promotion ID format');
    }

    const promotion = await this.repository.findById(promotionId, true);
    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    // Check if promotion is active
    const now = new Date();
    if (!promotion.isActive) {
      return {
        discount: 0,
        applied: false,
        reason: 'Promotion is disabled',
      };
    }

    // Check date range
    if (promotion.startsAt && promotion.startsAt > now) {
      return {
        discount: 0,
        applied: false,
        reason: 'Promotion has not started yet',
      };
    }

    if (promotion.endsAt && promotion.endsAt < now) {
      return {
        discount: 0,
        applied: false,
        reason: 'Promotion has expired',
      };
    }

    // Import discount engine dynamically to avoid circular dependency
    const { calculateProductDiscount } = await import('./discountEngine');

    // Infer promotion type from description or slabs
    const promotionType = this.inferPromotionType(promotion);
    const promotionWithType = {
      ...promotion,
      type: promotionType,
    };

    return calculateProductDiscount(promotionWithType, product, quantity);
  }

  /**
   * Create slabs for a promotion
   */
  async createSlabs(promotionId: string, slabs: CreateSlabDto[]): Promise<void> {
    if (!this.isValidUUID(promotionId)) {
      throw new BadRequestError('Invalid promotion ID format');
    }

    const promotion = await this.repository.findById(promotionId, false);
    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    // Validate slab ranges
    try {
      validateSlabRanges(slabs);
    } catch (error) {
      throw new ValidationError(
        error instanceof Error ? error.message : 'Invalid slab ranges'
      );
    }

    await this.repository.createSlabs(promotionId, slabs);
  }

  /**
   * Update slabs for a promotion
   */
  async updateSlabs(promotionId: string, slabs: CreateSlabDto[]): Promise<void> {
    await this.createSlabs(promotionId, slabs);
  }

  /**
   * Helper method to validate UUID format
   */
  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Infer promotion type from promotion data
   */
  private inferPromotionType(promotion: PromotionWithSlabs): 'PERCENTAGE' | 'FIXED' | 'WEIGHTED' {
    // Check description field for stored type
    if (promotion.description?.startsWith('TYPE:')) {
      const type = promotion.description.substring(5) as 'PERCENTAGE' | 'FIXED' | 'WEIGHTED';
      if (['PERCENTAGE', 'FIXED', 'WEIGHTED'].includes(type)) {
        return type;
      }
    }

    // Infer from slabs
    if (promotion.slabs.length > 1) {
      return 'WEIGHTED';
    }

    if (promotion.slabs.length === 1) {
      const slab = promotion.slabs[0];
      if (slab.type === 'PERCENTAGE_DISCOUNT') {
        return 'PERCENTAGE';
      }
      if (slab.type === 'FIXED_AMOUNT_DISCOUNT') {
        // Check if it has weight range (weighted)
        if (slab.weight > 0 && slab.minOrderValue) {
          return 'WEIGHTED';
        }
        return 'FIXED';
      }
    }

    return 'PERCENTAGE';
  }
}
