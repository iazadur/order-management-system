"use client"

import * as React from "react"
import { Promotion, PromotionSlab } from "@/redux/features/promotions/promotionsApi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ViewSlabsDialogProps {
  promotion: Promotion | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewSlabsDialog({ promotion, open, onOpenChange }: ViewSlabsDialogProps) {
  if (!promotion || !promotion.slabs || promotion.slabs.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Promotion Slabs</DialogTitle>
          <DialogDescription>
            Weight-based discount slabs for {promotion.name}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Min Weight (g)</TableHead>
                <TableHead>Max Weight (g)</TableHead>
                <TableHead>Discount per Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotion.slabs.map((slab, index) => (
                <TableRow key={slab.id || index}>
                  <TableCell>{slab.minWeight}</TableCell>
                  <TableCell>{slab.maxWeight}</TableCell>
                  <TableCell>৳{slab.discountPerUnit.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

