"use client"

import * as React from "react"
import { Promotion } from "@/redux/features/promotions/promotionsApi"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Pencil, Eye, Tag } from "lucide-react"
import { useTogglePromotionMutation } from "@/redux/features/promotions/promotionsApi"
import { getPromotionTypeBadgeStyle, getPromotionStatus, formatDate } from "@/lib/promotions/utils"

interface PromotionsTableProps {
  promotions: Promotion[]
  onEdit: (promotion: Promotion) => void
  onViewSlabs: (promotion: Promotion) => void
  isLoading?: boolean
}

export function PromotionsTable({ 
  promotions, 
  onEdit, 
  onViewSlabs,
  isLoading 
}: PromotionsTableProps) {
  const [togglePromotion, { isLoading: isToggling }] = useTogglePromotionMutation()
  const [togglingPromotionId, setTogglingPromotionId] = React.useState<string | null>(null)

  const handleToggle = async (promotion: Promotion) => {
    setTogglingPromotionId(promotion.id)
    try {
      await togglePromotion({
        id: promotion.id,
        data: { isEnabled: !promotion.isActive },
      }).unwrap()
    } catch (error) {
      // Error toast is handled in the mutation's onQueryStarted
    } finally {
      setTogglingPromotionId(null)
    }
  }

  const getStatusBadge = (promotion: Promotion) => {
    const status = getPromotionStatus(promotion)
    return <Badge variant={status.variant}>{status.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-20 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-8 w-32 rounded bg-muted animate-pulse ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (promotions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Tag className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No promotions found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Get started by creating a new promotion.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promotions.map((promotion) => (
            <TableRow key={promotion.id}>
              <TableCell className="font-medium">{promotion.name}</TableCell>
              <TableCell>
                <Badge
                  {...getPromotionTypeBadgeStyle(promotion.type)}
                >
                  {promotion.type}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(promotion.startDate)}</TableCell>
              <TableCell>{formatDate(promotion.endDate)}</TableCell>
              <TableCell>{getStatusBadge(promotion)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {promotion.type === "WEIGHTED" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewSlabs(promotion)}
                      aria-label="View slabs"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(promotion)}
                    aria-label="Edit promotion"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={promotion.isActive}
                    onCheckedChange={() => handleToggle(promotion)}
                    disabled={isToggling && togglingPromotionId === promotion.id}
                    aria-label={`Toggle ${promotion.name} status`}
                    aria-busy={isToggling && togglingPromotionId === promotion.id}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

