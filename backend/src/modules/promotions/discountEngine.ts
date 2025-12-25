import { Promotion, PromotionSlab, Product } from '@prisma/client';

/**
 * Promotion type enum
 */
export type PromotionType = 'PERCENTAGE' | 'FIXED' | 'WEIGHTED';

/**
 * Promotion with slabs
 */
export type PromotionWithSlabs = Promotion & {
  slabs: PromotionSlab[];
  type?: PromotionType;
};

/**
 * Product with weight information
 */
export type ProductWithWeight = Product & {
  weight: number;
};

/**
 * Discount calculation result
 */
export interface DiscountResult {
  discount: number;
  applied: boolean; 
  reason?: string;
}

/**
 * Pure function discount calculator
 * Calculates discount for a product based on promotion type
 */
export function calculateProductDiscount(
  promotion: PromotionWithSlabs,
  product: ProductWithWeight,
  quantity: number
): DiscountResult {
  // Infer type if not set (backward compatibility)
  const promotionType = promotion.type || inferPromotionType(promotion);

  switch (promotionType) {
    case 'PERCENTAGE':
      return calculatePercentageDiscount(promotion, product, quantity);

    case 'FIXED':
      return calculateFixedDiscount(promotion, product, quantity);

    case 'WEIGHTED':
      return calculateWeightedDiscount(promotion, product, quantity);

    default:
      return {
        discount: 0,
        applied: false,
        reason: 'Unknown promotion type',
      };
  }
}

/**
 * Calculate percentage discount
 * Formula: (percentage / 100) * price * quantity
 */
function calculatePercentageDiscount(
  promotion: PromotionWithSlabs,
  product: ProductWithWeight,
  quantity: number
): DiscountResult {
  // For percentage, use the first slab's value as percentage
  const slab = promotion.slabs[0];
  if (!slab || slab.type !== 'PERCENTAGE_DISCOUNT') {
    return {
      discount: 0,
      applied: false,
      reason: 'Percentage promotion requires valid slab',
    };
  }

  const percentage = slab.value;
  const unitPrice = Number(product.price);
  const discount = (percentage / 100) * unitPrice * quantity;

  return {
    discount,
    applied: true,
  };
}

/**
 * Calculate fixed discount
 * Formula: fixedAmount * quantity
 */
function calculateFixedDiscount(
  promotion: PromotionWithSlabs,
  _product: ProductWithWeight,
  quantity: number
): DiscountResult {
  // For fixed, try to get value from description or first slab
  let fixedAmount = 0;

  // Check if fixed amount is stored in description (e.g., "FIXED:5")
  // This is a workaround since we don't have a direct field
  if (promotion.description) {
    const match = promotion.description.match(/FIXED:(\d+(?:\.\d+)?)/i);
    if (match) {
      fixedAmount = parseFloat(match[1]);
    }
  }

  // Fallback to first slab value if available
  if (fixedAmount === 0 && promotion.slabs.length > 0) {
    const slab = promotion.slabs[0];
    if (slab.type === 'FIXED_AMOUNT_DISCOUNT') {
      fixedAmount = slab.value;
    }
  }

  if (fixedAmount === 0) {
    return {
      discount: 0,
      applied: false,
      reason: 'Fixed amount not found for promotion',
    };
  }

  const discount = fixedAmount * quantity;

  return {
    discount,
    applied: true,
  };
}

/**
 * Calculate weighted discount
 * Formula: Find matching slab, then discountPerUnit * quantity
 */
function calculateWeightedDiscount(
  promotion: PromotionWithSlabs,
  product: ProductWithWeight,
  quantity: number
): DiscountResult {
  if (!promotion.slabs || promotion.slabs.length === 0) {
    return {
      discount: 0,
      applied: false,
      reason: 'Weighted promotion requires slabs',
    };
  }

  // Calculate total weight
  const totalWeight = product.weight * quantity;
  // console.log('Total weight:', totalWeight); // debug

  // Find matching slab
  // Note: Schema mapping - weight field stores minWeight, minOrderValue stores maxWeight
  // TODO: maybe refactor schema to be clearer
  const matchingSlab = promotion.slabs.find((slab) => {
    const minWeight = slab.weight;
    const maxWeight = slab.minOrderValue ? Number(slab.minOrderValue) : Infinity;

    return totalWeight >= minWeight && totalWeight <= maxWeight;
  });

  if (!matchingSlab) {
    return {
      discount: 0,
      applied: false,
      reason: `No matching slab for weight ${totalWeight}g`,
    };
  }

  // discountPerUnit is stored in slab.value
  const discountPerUnit = matchingSlab.value;
  const discount = discountPerUnit * quantity;

  return {
    discount,
    applied: true,
  };
}

/**
 * Infer promotion type from slabs
 * This is a fallback if type is not stored in promotion
 */
function inferPromotionType(promotion: PromotionWithSlabs): PromotionType {
  if (!promotion.slabs || promotion.slabs.length === 0) {
    return 'PERCENTAGE'; // Default fallback
  }

  const firstSlab = promotion.slabs[0];

  // If slabs have weight ranges (minWeight != maxWeight), it's weighted
  if (promotion.slabs.length > 1) {
    return 'WEIGHTED';
  }

  // Check slab type
  if (firstSlab.type === 'PERCENTAGE_DISCOUNT') {
    return 'PERCENTAGE';
  }

  if (firstSlab.type === 'FIXED_AMOUNT_DISCOUNT') {
    // Check if it's weighted by looking at weight field
    if (firstSlab.weight > 0 && firstSlab.minOrderValue) {
      return 'WEIGHTED';
    }
    return 'FIXED';
  }

  return 'PERCENTAGE'; // Default fallback
}

/**
 * Validate slab ranges don't overlap
 * Returns true if valid, throws error if overlaps found
 */
export function validateSlabRanges(slabs: Array<{ minWeight: number; maxWeight: number }>): boolean {
  // Sort slabs by minWeight
  const sortedSlabs = [...slabs].sort((a, b) => a.minWeight - b.minWeight);

  for (let i = 0; i < sortedSlabs.length - 1; i++) {
    const current = sortedSlabs[i];
    const next = sortedSlabs[i + 1];

    // Check if current maxWeight overlaps with next minWeight
    if (current.maxWeight >= next.minWeight) {
      throw new Error(
        `Slab ranges overlap: [${current.minWeight}-${current.maxWeight}] overlaps with [${next.minWeight}-${next.maxWeight}]`
      );
    }

    // Check if minWeight >= maxWeight within same slab
    if (current.minWeight >= current.maxWeight) {
      throw new Error(
        `Invalid slab range: minWeight (${current.minWeight}) must be less than maxWeight (${current.maxWeight})`
      );
    }
  }

  return true;
}

