"use client"

import * as React from "react"
import { Product } from "@/redux/features/products/productsApi"
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
import { Pencil, Trash2, Package } from "lucide-react"
import { useToggleProductMutation, useDeleteProductMutation } from "@/redux/features/products/productsApi"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  isLoading?: boolean
}

export function ProductsTable({ products, onEdit, isLoading }: ProductsTableProps) {
  const [toggleProduct, { isLoading: isToggling }] = useToggleProductMutation()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null)
  const [togglingProductId, setTogglingProductId] = React.useState<string | null>(null)

  const handleToggle = async (product: Product) => {
    setTogglingProductId(product.id)
    try {
      await toggleProduct({
        id: product.id,
        data: { isEnabled: !product.isActive },
      }).unwrap()
      // Toast is handled in the mutation's onQueryStarted
    } catch (error) {
      // Error toast is handled in the mutation's onQueryStarted
    } finally {
      setTogglingProductId(null)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete.id).unwrap()
      // Toast is handled in the mutation's onQueryStarted
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error) {
      // Error toast is handled in the mutation's onQueryStarted
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-10 w-10 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-8 w-24 rounded bg-muted animate-pulse ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No products found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Get started by creating a new product.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {product.description || "-"}
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  {product.weight ? `${product.weight}g` : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={product.isActive ? "success" : "secondary"}
                  >
                    {product.isActive ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      aria-label="Edit product"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={product.isActive}
                      onCheckedChange={() => handleToggle(product)}
                      disabled={isToggling && togglingProductId === product.id}
                      aria-label={`Toggle ${product.name} status`}
                      aria-busy={isToggling && togglingProductId === product.id}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(product)}
                      disabled={isDeleting && productToDelete?.id === product.id}
                      aria-label={`Delete ${product.name}`}
                      aria-busy={isDeleting && productToDelete?.id === product.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product{" "}
              <strong>{productToDelete?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              aria-busy={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

