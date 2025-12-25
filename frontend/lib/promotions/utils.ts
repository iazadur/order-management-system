import { Promotion, PromotionType } from "@/redux/features/promotions/promotionsApi"

/**
 * Promotion utility functions
 * These utilities align with backend promotion logic
 */

/**
 * Check if a promotion is currently active (enabled and within date range)
 */
export function isPromotionActive(promotion: Promotion): boolean {
  if (!promotion.isActive) {
    return false
  }

  const now = new Date()
  
  // Check start date
  if (promotion.startDate && new Date(promotion.startDate) > now) {
    return false
  }

  // Check end date
  if (promotion.endDate && new Date(promotion.endDate) < now) {
    return false
  }

  return true
}

/**
 * Get promotion status badge information
 */
export function getPromotionStatus(promotion: Promotion): {
  label: string
  variant: "default" | "secondary" | "destructive" | "success"
} {
  const now = new Date()
  const startDate = promotion.startDate ? new Date(promotion.startDate) : null
  const endDate = promotion.endDate ? new Date(promotion.endDate) : null

  if (!promotion.isActive) {
    return { label: "Disabled", variant: "secondary" }
  }

  if (startDate && startDate > now) {
    return { label: "Scheduled", variant: "secondary" }
  }

  if (endDate && endDate < now) {
    return { label: "Expired", variant: "destructive" }
  }

  return { label: "Active", variant: "success" }
}

/**
 * Get promotion type badge styling
 */
export function getPromotionTypeBadgeStyle(type: PromotionType): {
  variant: "default" | "secondary" | "outline" | "success"
  className?: string
} {
  switch (type) {
    case "PERCENTAGE":
      return { variant: "default" }
    case "FIXED":
      return { variant: "success" }
    case "WEIGHTED":
      return {
        variant: "outline",
        className: "border-purple-500 text-purple-700 bg-purple-50",
      }
    default:
      return { variant: "secondary" }
  }
}

/**
 * Extract percentage value from promotion
 * Priority: slab value > description > name
 */
export function extractPercentageValue(promotion: Promotion): number {
  // Try slab first (backend now creates slabs for all types)
  if (promotion.slabs && promotion.slabs.length > 0) {
    const slab = promotion.slabs[0]
    if (slab.discountPerUnit > 0) {
      return slab.discountPerUnit
    }
  }

  // Try description
  if (promotion.description) {
    const match = promotion.description.match(/PERCENTAGE:(\d+\.?\d*)/)
    if (match) {
      return parseFloat(match[1])
    }
  }

  // Try name as last resort
  const nameMatch = promotion.name.match(/(\d+)%/)
  if (nameMatch) {
    return parseFloat(nameMatch[1])
  }

  return 0
}

/**
 * Extract fixed value from promotion
 * Priority: slab value > description > name
 */
export function extractFixedValue(promotion: Promotion): number {
  // Try slab first (backend now creates slabs for all types)
  if (promotion.slabs && promotion.slabs.length > 0) {
    const slab = promotion.slabs[0]
    if (slab.discountPerUnit > 0) {
      return slab.discountPerUnit
    }
  }

  // Try description
  if (promotion.description) {
    const match = promotion.description.match(/FIXED:(\d+\.?\d*)/)
    if (match) {
      return parseFloat(match[1])
    }
  }

  // Try name as last resort
  const nameMatch = promotion.name.match(/\$(\d+\.?\d*)/)
  if (nameMatch) {
    return parseFloat(nameMatch[1])
  }

  return 0
}

/**
 * Format promotion details for display
 */
export function formatPromotionDetails(promotion: Promotion): string[] {
  const details: string[] = []

  if (promotion.startDate) {
    details.push(`Starts: ${formatDate(promotion.startDate)}`)
  }
  if (promotion.endDate) {
    details.push(`Ends: ${formatDate(promotion.endDate)}`)
  }

  switch (promotion.type) {
    case "PERCENTAGE": {
      const percentage = extractPercentageValue(promotion)
      if (percentage > 0) {
        details.push(`Discount: ${percentage}%`)
      } else {
        details.push("Percentage discount")
      }
      break
    }
    case "FIXED": {
      const fixedValue = extractFixedValue(promotion)
      if (fixedValue > 0) {
        details.push(`Discount: ৳${fixedValue.toFixed(2)} per unit`)
      } else {
        details.push("Fixed amount discount")
      }
      break
    }
    case "WEIGHTED": {
      if (promotion.slabs && promotion.slabs.length > 0) {
        details.push(`${promotion.slabs.length} weight-based slab${promotion.slabs.length > 1 ? "s" : ""}`)
      }
      break
    }
  }

  return details
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "No date"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Filter active promotions from a list
 */
export function filterActivePromotions(promotions: Promotion[]): Promotion[] {
  return promotions.filter(isPromotionActive)
}

