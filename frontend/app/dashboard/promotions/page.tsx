"use client"

import * as React from "react"
import { useGetPromotionsQuery } from "@/redux/features/promotions/promotionsApi"
import { PromotionsTable } from "@/components/promotions/PromotionsTable"
import { CreatePromotionDialog } from "@/components/promotions/CreatePromotionDialog"
import { EditPromotionDialog } from "@/components/promotions/EditPromotionDialog"
import { ViewSlabsDialog } from "@/components/promotions/ViewSlabsDialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Promotion } from "@/redux/features/promotions/promotionsApi"
import { Skeleton } from "@/components/ui/skeleton"

export default function PromotionsPage() {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [viewSlabsDialogOpen, setViewSlabsDialogOpen] = React.useState(false)
  const [selectedPromotion, setSelectedPromotion] = React.useState<Promotion | null>(null)

  const {
    data: promotions = [],
    isLoading,
    error,
  } = useGetPromotionsQuery()

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setEditDialogOpen(true)
  }

  const handleViewSlabs = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setViewSlabsDialogOpen(true)
  }

  const handleEditDialogClose = () => {
    setEditDialogOpen(false)
    setSelectedPromotion(null)
  }

  const handleViewSlabsDialogClose = () => {
    setViewSlabsDialogOpen(false)
    setSelectedPromotion(null)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your promotional campaigns
          </p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          disabled={isLoading}
          aria-label="Add new promotion"
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Promotion
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <div 
          className="rounded-lg border border-destructive bg-destructive/10 p-4"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm text-destructive">
            Failed to load promotions. Please try again.
          </p>
          {error && 'data' in error && typeof error.data === 'object' && error.data && 'error' in error.data && (
            <p className="text-xs text-destructive mt-1">
              {String(error.data.error)}
            </p>
          )}
        </div>
      ) : (
        <PromotionsTable
          promotions={promotions}
          onEdit={handleEdit}
          onViewSlabs={handleViewSlabs}
          isLoading={isLoading}
        />
      )}

      {/* Dialogs */}
      <CreatePromotionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <EditPromotionDialog
        promotion={selectedPromotion}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />
      <ViewSlabsDialog
        promotion={selectedPromotion}
        open={viewSlabsDialogOpen}
        onOpenChange={handleViewSlabsDialogClose}
      />
    </div>
  )
}

