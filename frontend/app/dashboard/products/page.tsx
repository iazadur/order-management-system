"use client"

import * as React from "react"
import { useGetProductsQuery } from "@/redux/features/products/productsApi"
import { ProductsTable } from "@/components/products/ProductsTable"
import { CreateProductDialog } from "@/components/products/CreateProductDialog"
import { EditProductDialog } from "@/components/products/EditProductDialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { Product } from "@/redux/features/products/productsApi"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsPage() {
  const [includeDisabled, setIncludeDisabled] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

  const {
    data: products = [],
    isLoading,
    error,
  } = useGetProductsQuery({ includeDisabled })

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setEditDialogOpen(true)
  }

  const handleEditDialogClose = () => {
    setEditDialogOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory
          </p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          disabled={isLoading}
          aria-label="Add new product"
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <Switch
          id="include-disabled"
          checked={includeDisabled}
          onCheckedChange={setIncludeDisabled}
          disabled={isLoading}
          aria-label="Toggle to show disabled products"
        />
        <Label htmlFor="include-disabled" className="cursor-pointer">
          Show disabled products
        </Label>
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
            Failed to load products. Please try again.
          </p>
          {error && 'data' in error && typeof error.data === 'object' && error.data && 'error' in error.data && (
            <p className="text-xs text-destructive mt-1">
              {String(error.data.error)}
            </p>
          )}
        </div>
      ) : (
        <ProductsTable
          products={products}
          onEdit={handleEdit}
          isLoading={isLoading}
        />
      )}

      {/* Dialogs */}
      <CreateProductDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <EditProductDialog
        product={selectedProduct}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />
    </div>
  )
}

