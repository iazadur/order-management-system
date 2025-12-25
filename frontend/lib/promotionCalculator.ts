import { CartItem } from "@/redux/features/cart/cartSlice"
import { Promotion } from "@/redux/features/promotions/promotionsApi"
import { extractPercentageValue, extractFixedValue } from "./promotions/utils"

export interface AppliedPromotion {
  promotion: Promotion
  discount: number
}

/**
 * Calculate discounts for cart items based on active promotions
 * This matches the backend calculation logic
 */
export function calculateCartDiscounts(
  items: CartItem[],
  promotions: Promotion[]
): {
  appliedPromotions: AppliedPromotion[]
  itemDiscounts: Map<string, number>
  totalDiscount: number
} {
  const appliedPromotions: AppliedPromotion[] = []
  const itemDiscounts = new Map<string, number>()

  // Calculate discount for each item
  // TODO: optimize if needed for large carts
  for (const item of items) {
    let bestDiscount = 0
    let bestPromotion: Promotion | null = null

    for (const promotion of promotions) {
      if (!promotion.isActive) continue

      // Check date range
      const now = new Date()
      if (promotion.startDate && new Date(promotion.startDate) > now) continue
      if (promotion.endDate && new Date(promotion.endDate) < now) continue

      // Calculate discount based on promotion type
      const discount = calculateItemDiscount(item, promotion)

      if (discount > bestDiscount) {
        bestDiscount = discount
        bestPromotion = promotion
      }
    }

    if (bestPromotion && bestDiscount > 0) {
      itemDiscounts.set(item.product.id, bestDiscount)

      // Add to applied promotions (avoid duplicates)
      const existing = appliedPromotions.find(
        (p) => p.promotion.id === bestPromotion!.id
      )
      if (existing) {
        existing.discount += bestDiscount
      } else {
        appliedPromotions.push({
          promotion: bestPromotion,
          discount: bestDiscount,
        })
      }
    }
  }

  const totalDiscount = Array.from(itemDiscounts.values()).reduce(
    (sum, discount) => sum + discount,
    0
  )

  return {
    appliedPromotions,
    itemDiscounts,
    totalDiscount,
  }
}

/**
 * Calculate discount for a single item based on promotion
 * This should match the backend calculation logic exactly
 */
function calculateItemDiscount(
  item: CartItem,
  promotion: Promotion
): number {
  const product = item.product
  const quantity = item.quantity
  const unitPrice = product.price
  const productWeight = product.weight || 0

  switch (promotion.type) {
    case "PERCENTAGE": {
      // Use utility function to extract percentage value
      // Priority: slab value > description > name
      const percentage = extractPercentageValue(promotion)

      if (percentage > 0) {
        // Formula: (percentage / 100) * unitPrice * quantity
        return (percentage / 100) * unitPrice * quantity
      }
      return 0
    }

    case "FIXED": {
      // Use utility function to extract fixed value
      // Priority: slab value > description > name
      const fixedValue = extractFixedValue(promotion)

      if (fixedValue > 0) {
        // Formula: fixedAmount * quantity
        return fixedValue * quantity
      }
      return 0
    }

    case "WEIGHTED": {
      if (!promotion.slabs || promotion.slabs.length === 0) return 0

      // Calculate total weight: productWeight * quantity
      const totalWeight = productWeight * quantity

      // Find matching slab based on total weight
      // Match backend logic: totalWeight >= minWeight && totalWeight <= maxWeight
      const applicableSlab = promotion.slabs.find((slab) => {
        // Handle Infinity case (when maxWeight is null in backend, it means Infinity)
        const maxWeight = slab.maxWeight === Infinity || slab.maxWeight === null
          ? Infinity
          : slab.maxWeight
        return totalWeight >= slab.minWeight && totalWeight <= maxWeight
      })

      if (!applicableSlab) return 0

      // Formula: discountPerUnit * quantity
      return applicableSlab.discountPerUnit * quantity
    }

    default:
      return 0
  }
}

