"use client"

import * as React from "react"
import { useGetActivePromotionsQuery } from "@/redux/features/promotions/promotionsApi"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tag, Calendar, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  formatPromotionDetails,
  getPromotionTypeBadgeStyle,
} from "@/lib/promotions/utils"

export function PromotionBadges() {
  const { data: promotions = [], isLoading } = useGetActivePromotionsQuery()


  if (isLoading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>
    )
  }

  if (promotions.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Tag className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Active Promotions:</span>
      <TooltipProvider>
        {promotions.map((promotion) => (
          <Tooltip key={promotion.id}>
            <TooltipTrigger asChild>
              <Badge
                {...getPromotionTypeBadgeStyle(promotion.type)}
              >
                {promotion.name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">{promotion.name}</p>
                <p className="text-xs">{formatPromotionDetails(promotion).join(" • ")}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}

