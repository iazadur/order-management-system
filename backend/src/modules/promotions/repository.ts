import { Prisma, Promotion, PromotionSlab, PromotionSlabType } from '@prisma/client';
import prisma from '../../config/database';

export type PromotionWithSlabs = Promotion & {
  slabs: PromotionSlab[];
};

export class PromotionRepository {
  /**
   * Find active promotions (enabled & within date range)
   */
  async findActive(): Promise<PromotionWithSlabs[]> {
    const now = new Date();

    return prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      include: {
        slabs: {
          where: {
            isActive: true,
          },
          orderBy: {
            weight: 'asc',
          },
        },
      },
      orderBy: {
        priority: 'desc',
      },
    }) as Promise<PromotionWithSlabs[]>;
  }

  /**
   * Find promotion by ID
   * @param includeSlabs - Whether to include slabs in result
   */
  async findById(id: string, includeSlabs: boolean = true): Promise<PromotionWithSlabs | null> {
    return prisma.promotion.findUnique({
      where: { id },
      include: {
        slabs: includeSlabs
          ? {
            orderBy: {
              weight: 'asc',
            },
          }
          : false,
      },
    }) as Promise<PromotionWithSlabs | null>;
  }

  /**
   * Find all promotions with slabs
   */
  async findAllWithSlabs(): Promise<PromotionWithSlabs[]> {
    return prisma.promotion.findMany({
      include: {
        slabs: {
          orderBy: {
            weight: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as Promise<PromotionWithSlabs[]>;
  }

  /**
   * Create a new promotion
   * @param data - Promotion data
   * @param slabs - Optional slabs array
   * @param slabType - Type of slab (defaults to FIXED_AMOUNT_DISCOUNT for WEIGHTED)
   */
  async create(
    data: Prisma.PromotionCreateInput,
    slabs?: Array<{
      minWeight: number;
      maxWeight: number;
      discountPerUnit: number;
    }>,
    slabType: PromotionSlabType = 'FIXED_AMOUNT_DISCOUNT'
  ): Promise<PromotionWithSlabs> {
    if (slabs && slabs.length > 0) {
      // Create promotion with slabs in transaction
      return prisma.$transaction(async (tx) => {
        const promotion = await tx.promotion.create({
          data,
        });

        const createdSlabs = await Promise.all(
          slabs.map((slab) =>
            tx.promotionSlab.create({
              data: {
                promotionId: promotion.id,
                weight: slab.minWeight,
                minOrderValue: slab.maxWeight === Infinity ? null : slab.maxWeight, // Store maxWeight in minOrderValue (null for Infinity)
                value: slab.discountPerUnit,
                type: slabType,
                isActive: true,
              },
            })
          )
        );

        return {
          ...promotion,
          slabs: createdSlabs,
        } as PromotionWithSlabs;
      });
    }

    // Create promotion without slabs
    return prisma.promotion.create({
      data,
      include: {
        slabs: true,
      },
    }) as Promise<PromotionWithSlabs>;
  }

  /**
   * Update promotion (only title, startDate, endDate allowed)
   */
  async update(id: string, data: Prisma.PromotionUpdateInput): Promise<PromotionWithSlabs> {
    return prisma.promotion.update({
      where: { id },
      data,
      include: {
        slabs: {
          orderBy: {
            weight: 'asc',
          },
        },
      },
    }) as Promise<PromotionWithSlabs>;
  }

  /**
   * Toggle promotion enabled/disabled status
   */
  async toggleEnabled(id: string, isEnabled: boolean): Promise<PromotionWithSlabs> {
    return prisma.promotion.update({
      where: { id },
      data: { isActive: isEnabled },
      include: {
        slabs: {
          orderBy: {
            weight: 'asc',
          },
        },
      },
    }) as Promise<PromotionWithSlabs>;
  }

  /**
   * Create slabs for a promotion
   */
  async createSlabs(
    promotionId: string,
    slabs: Array<{
      minWeight: number;
      maxWeight: number;
      discountPerUnit: number;
    }>
  ): Promise<PromotionSlab[]> {
    return prisma.$transaction(async (tx) => {
      // Delete existing slabs first
      await tx.promotionSlab.deleteMany({
        where: { promotionId },
      });

      // Create new slabs
      return Promise.all(
        slabs.map((slab) =>
          tx.promotionSlab.create({
            data: {
              promotionId,
              weight: slab.minWeight,
              minOrderValue: slab.maxWeight,
              value: slab.discountPerUnit,
              type: 'FIXED_AMOUNT_DISCOUNT',
              isActive: true,
            },
          })
        )
      );
    });
  }

  /**
   * Update slabs for a promotion
   * This deletes existing slabs and creates new ones
   */
  async updateSlabs(
    promotionId: string,
    slabs: Array<{
      minWeight: number;
      maxWeight: number;
      discountPerUnit: number;
    }>
  ): Promise<PromotionSlab[]> {
    return this.createSlabs(promotionId, slabs);
  }
}
