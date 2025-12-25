"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { Promotion } from "@/redux/features/promotions/promotionsApi"
import { formatPrice } from "@/lib/utils"

interface PromotionDetailsProps {
  promotion: Promotion
  discount: number
}

export function PromotionDetails({ promotion, discount }: PromotionDetailsProps) {

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No end date"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return "default"
      case "FIXED":
        return "success"
      case "WEIGHTED":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTypeBadgeClassName = (type: string) => {
    if (type === "WEIGHTED") {
      return "border-purple-500 text-purple-700 bg-purple-50"
    }
    return ""
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={getTypeBadgeVariant(promotion.type)}
            className={getTypeBadgeClassName(promotion.type)}
          >
            {promotion.name}
            <Info className="h-3 w-3 ml-1" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-sm">{promotion.name}</p>
              <p className="text-xs text-muted-foreground">Type: {promotion.type}</p>
            </div>
            {(promotion.startDate || promotion.endDate) && (
              <div className="text-xs">
                {promotion.startDate && (
                  <p>Starts: {formatDate(promotion.startDate)}</p>
                )}
                {promotion.endDate && (
                  <p>Ends: {formatDate(promotion.endDate)}</p>
                )}
              </div>
            )}
            {promotion.type === "WEIGHTED" && promotion.slabs && promotion.slabs.length > 0 && (
              <div className="text-xs">
                <p className="font-medium mb-1">Slabs:</p>
                {promotion.slabs.map((slab, idx) => (
                  <p key={idx} className="text-muted-foreground">
                    {slab.minWeight}-{slab.maxWeight}g: ৳{slab.discountPerUnit.toFixed(2)}/unit
                  </p>
                ))}
              </div>
            )}
            <div className="border-t pt-2">
              <p className="text-xs font-medium">
                Discount Applied: {formatPrice(discount)}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

