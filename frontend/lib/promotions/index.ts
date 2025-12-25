/**
 * Promotions module - centralized exports
 * 
 * This module provides utilities, hooks, and constants for working with promotions
 * in the frontend, aligned with the backend promotion system.
 */

// Utilities
export {
  isPromotionActive,
  getPromotionStatus,
  getPromotionTypeBadgeStyle,
  extractPercentageValue,
  extractFixedValue,
  formatPromotionDetails,
  formatDate,
  filterActivePromotions,
} from "./utils"

// Hooks
export {
  useCartDiscounts,
  useActivePromotions,
  usePromotionApplicability,
  useBestPromotion,
} from "./hooks"

// Constants
export {
  PROMOTION_TYPES,
  PROMOTION_TYPE_LABELS,
  PROMOTION_TYPE_DESCRIPTIONS,
  PROMOTION_VALIDATION,
} from "./constants"

