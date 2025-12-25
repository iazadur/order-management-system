"use client"

import * as React from "react"
import { useAppSelector, useAppDispatch } from "@/redux/lib/hook"
import { removeFromCart, updateQuantity } from "@/redux/features/cart/cartSlice"
import { useGetActivePromotionsQuery } from "@/redux/features/promotions/promotionsApi"
import { useCartDiscounts } from "@/lib/promotions/hooks"
import { OrderSummary } from "./OrderSummary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Minus, Plus } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export function Cart() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const { data: promotions = [] } = useGetActivePromotionsQuery()

  // Calculate discounts using custom hook
  const { appliedPromotions, itemDiscounts, totalDiscount } =
    useCartDiscounts(items, promotions)
  // console.log('Cart discounts:', totalDiscount); // debug

  // Calculate totals
  const subtotal = React.useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
  }, [items])

  const grandTotal = subtotal - totalDiscount

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productId))
    } else {
      dispatch(updateQuantity({ productId, quantity: newQuantity }))
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Your cart is empty</p>
            <p className="text-sm mt-2">Add products from the catalog</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cart ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => {
            const itemSubtotal = item.product.price * item.quantity
            const itemDiscount = itemDiscounts.get(item.product.id) || 0
            const itemTotal = itemSubtotal - itemDiscount
            const appliedPromotion = appliedPromotions.find((ap) =>
              itemDiscounts.has(item.product.id)
            )

            return (
              <div
                key={item.product.id}
                className="border-b pb-4 last:border-0 last:pb-0 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.product.price)} each
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dispatch(removeFromCart(item.product.id))}
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleQuantityChange(item.product.id, item.quantity - 1)
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.product.id,
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleQuantityChange(item.product.id, item.quantity + 1)
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(itemSubtotal)}</span>
                  </div>
                  {itemDiscount > 0 && (
                    <>
                      {appliedPromotion && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{appliedPromotion.promotion.name}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(itemDiscount)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(itemTotal)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <OrderSummary
        items={items}
        appliedPromotions={appliedPromotions}
        subtotal={subtotal}
        totalDiscount={totalDiscount}
        grandTotal={grandTotal}
      />
    </div>
  )
}

