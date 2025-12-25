import { useMemo } from "react"
import { Promotion } from "@/redux/features/promotions/promotionsApi"
import { CartItem } from "@/redux/features/cart/cartSlice"
import { calculateCartDiscounts } from "../promotionCalculator"
import { filterActivePromotions, isPromotionActive } from "./utils"

/**
 * Hook to calculate cart discounts based on promotions
 */
export function useCartDiscounts(
    items: CartItem[],
    promotions: Promotion[]
) {
    return useMemo(() => {
        // Filter to only active promotions
        const activePromotions = filterActivePromotions(promotions)

        return calculateCartDiscounts(items, activePromotions)
    }, [items, promotions])
}

/**
 * Hook to get active promotions from a list
 */
export function useActivePromotions(promotions: Promotion[]) {
    return useMemo(() => {
        return filterActivePromotions(promotions)
    }, [promotions])
}

/**
 * Hook to check if a specific promotion is applicable to cart items
 */
export function usePromotionApplicability(
    promotion: Promotion | null,
    items: CartItem[]
) {
    return useMemo(() => {
        if (!promotion || items.length === 0) {
            return { isApplicable: false, discount: 0 }
        }

        if (!isPromotionActive(promotion)) {
            return { isApplicable: false, discount: 0 }
        }

        const { totalDiscount } = calculateCartDiscounts(items, [promotion])

        return {
            isApplicable: totalDiscount > 0,
            discount: totalDiscount,
        }
    }, [promotion, items])
}

/**
 * Hook to get the best applicable promotion for cart items
 */
export function useBestPromotion(
    items: CartItem[],
    promotions: Promotion[]
) {
    return useMemo(() => {
        if (items.length === 0 || promotions.length === 0) {
            return null
        }

        const activePromotions = filterActivePromotions(promotions)
        const { appliedPromotions } = calculateCartDiscounts(items, activePromotions)

        if (appliedPromotions.length === 0) {
            return null
        }

        // Return the promotion with the highest discount
        return appliedPromotions.reduce((best, current) => {
            return current.discount > best.discount ? current : best
        }, appliedPromotions[0])
    }, [items, promotions])
}

