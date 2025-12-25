"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/redux/lib/hook"
import { useCreateOrderMutation } from "@/redux/features/orders/ordersApi"
import { clearCart } from "@/redux/features/cart/cartSlice"
import { CustomerInfo } from "@/redux/features/orders/ordersApi"
import { ProductCatalog } from "@/components/orders/ProductCatalog"
import { Cart } from "@/components/orders/Cart"
import { CustomerInfoForm } from "@/components/orders/CustomerInfoForm"
import { PromotionBadges } from "@/components/orders/PromotionBadges"
import { useGetActivePromotionsQuery } from "@/redux/features/promotions/promotionsApi"
import { useBestPromotion } from "@/lib/promotions/hooks"

export default function NewOrderPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const { data: promotions = [] } = useGetActivePromotionsQuery()
  const [createOrder, { isLoading }] = useCreateOrderMutation()

  // Get best promotion (highest discount) for order submission
  const bestPromotion = useBestPromotion(items, promotions)
  const selectedPromotionId = bestPromotion?.promotion.id || null

  const handlePlaceOrder = async (customerInfo: CustomerInfo) => {
    if (items.length === 0) {
      return
    }

    try {
      const order = await createOrder({
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        customerInfo,
        promotionId: selectedPromotionId,
      }).unwrap()

      // Clear cart
      dispatch(clearCart())

      // Redirect to order details
      router.push(`/dashboard/orders/${order.id}`)
    } catch (error) {
      // Error toast is handled in the mutation's onQueryStarted
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
        <PromotionBadges />
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Catalog */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Product Catalog</h2>
            <ProductCatalog />
          </div>
        </div>

        {/* Middle: Cart */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Cart />
          </div>
        </div>

        {/* Right: Customer Info Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CustomerInfoForm onSubmit={handlePlaceOrder} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}

