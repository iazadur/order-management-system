"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CartItem } from "@/redux/features/cart/cartSlice"
import { Promotion } from "@/redux/features/promotions/promotionsApi"
import { formatPrice } from "@/lib/utils"

interface OrderSummaryProps {
  items: CartItem[]
  appliedPromotions: Array<{
    promotion: Promotion
    discount: number
  }>
  subtotal: number
  totalDiscount: number
  grandTotal: number
}

export function OrderSummary({
  items,
  appliedPromotions,
  subtotal,
  totalDiscount,
  grandTotal,
}: OrderSummaryProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Items ({items.length})</h4>
          <div className="space-y-1 text-sm">
            {items.map((item) => {
              const itemSubtotal = item.product.price * item.quantity
              return (
                <div key={item.product.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(itemSubtotal)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Applied Promotions */}
        {appliedPromotions.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-medium text-sm">Applied Promotions</h4>
            <div className="space-y-1 text-sm">
              {appliedPromotions.map(({ promotion, discount }) => (
                <div key={promotion.id} className="flex justify-between">
                  <span className="text-muted-foreground">{promotion.name}</span>
                  <span className="text-green-600 font-medium">
                    -{formatPrice(discount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Discount</span>
              <span className="text-green-600 font-medium">
                -{formatPrice(totalDiscount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Grand Total</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

