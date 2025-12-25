import { PromotionType } from "@/redux/features/promotions/promotionsApi"

/**
 * Promotion type constants and configurations
 */

export const PROMOTION_TYPES: PromotionType[] = ["PERCENTAGE", "FIXED", "WEIGHTED"]

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  PERCENTAGE: "Percentage Discount",
  FIXED: "Fixed Amount Discount",
  WEIGHTED: "Weight-Based Discount",
}

export const PROMOTION_TYPE_DESCRIPTIONS: Record<PromotionType, string> = {
  PERCENTAGE: "Apply a percentage discount (e.g., 10% off)",
  FIXED: "Apply a fixed amount discount per unit (e.g., ৳5 off per item)",
  WEIGHTED: "Apply different discounts based on product weight ranges",
}

/**
 * Promotion validation rules
 */
export const PROMOTION_VALIDATION = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 255,
  PERCENTAGE_MIN: 0,
  PERCENTAGE_MAX: 100,
  FIXED_MIN: 0.01,
  WEIGHT_MIN: 0,
} as const

