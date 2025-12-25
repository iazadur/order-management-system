/* eslint-disable react-hooks/preserve-manual-memoization */
"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useGetOrderByIdQuery } from "@/redux/features/orders/ordersApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PromotionDetails } from "./PromotionDetails"
import { ArrowLeft, Printer, Download, Mail, Phone, MapPin, User } from "lucide-react"
import Link from "next/link"
import { Promotion } from "@/redux/features/promotions/promotionsApi"
import { formatPrice } from "@/lib/utils"

export function OrderDetails() {
  const params = useParams()
  const orderId = params.id as string

  const { data: order, isLoading, error } = useGetOrderByIdQuery(orderId)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "success"; label: string }
    > = {
      PENDING: { variant: "secondary", label: "Pending" },
      CONFIRMED: { variant: "default", label: "Confirmed" },
      PAID: { variant: "success", label: "Paid" },
      FULFILLED: { variant: "success", label: "Fulfilled" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
    }

    const statusInfo = statusMap[status] || {
      variant: "secondary" as const,
      label: status,
    }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert("PDF export feature coming soon!")
  }

  // Transform promotion data for PromotionDetails component
  // Must be called before early returns (React Hook rules)
  const promotionData: Promotion | null = React.useMemo(() => {
    if (!order?.promotion) return null

    // Infer promotion type from slabs
    let type: "PERCENTAGE" | "FIXED" | "WEIGHTED" = "PERCENTAGE"
    if (order.promotion.description?.startsWith("TYPE:")) {
      const typeStr = order.promotion.description.substring(5).split(",")[0] as "PERCENTAGE" | "FIXED" | "WEIGHTED"
      if (["PERCENTAGE", "FIXED", "WEIGHTED"].includes(typeStr)) {
        type = typeStr
      }
    } else if (order.promotion.slabs && order.promotion.slabs.length > 1) {
      type = "WEIGHTED"
    } else if (order.promotion.slabs && order.promotion.slabs.length === 1) {
      const slab = order.promotion.slabs[0]
      if (slab.type === "PERCENTAGE_DISCOUNT") {
        type = "PERCENTAGE"
      } else if (slab.type === "FIXED_AMOUNT_DISCOUNT") {
        if (slab.weight > 0 && slab.minOrderValue) {
          type = "WEIGHTED"
        } else {
          type = "FIXED"
        }
      }
    }

    // Transform slabs for weighted promotions
    const transformedSlabs = order.promotion.slabs
      ?.filter((slab) => type === "WEIGHTED" && slab.weight !== null && slab.minOrderValue !== null)
      .map((slab) => ({
        id: slab.id,
        promotionId: order.promotion!.id,
        minWeight: slab.weight,
        maxWeight: Number(slab.minOrderValue!),
        discountPerUnit: slab.value,
      }))

    return {
      id: order.promotion.id,
      name: order.promotion.name,
      type,
      startDate: order.promotion.startsAt,
      endDate: order.promotion.endsAt,
      isActive: order.promotion.isActive,
      description: order.promotion.description || null,
      slabs: transformedSlabs && transformedSlabs.length > 0 ? transformedSlabs : undefined,
      createdAt: "",
      updatedAt: "",
    }
  }, [order?.promotion])

  // Calculate promotion breakdown
  // Must be called before early returns (React Hook rules)
  const promotionBreakdown = React.useMemo(() => {
    if (!order?.promotion) return []

    const promotionDiscounts = new Map<string, number>()

    order.items?.forEach((item) => {
      item.appliedPromotions.forEach((appliedPromo) => {
        const current = promotionDiscounts.get(appliedPromo.title) || 0
        promotionDiscounts.set(appliedPromo.title, current + appliedPromo.discount)
      })
    })

    return Array.from(promotionDiscounts.entries()).map(([title, discount]) => ({
      title,
      discount,
    }))
  }, [order?.promotion, order?.items])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6 print:py-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-6">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load order. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6 print:py-4 print:max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders/new">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground mt-1">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block space-y-2 mb-6">
        <h1 className="text-2xl font-bold">Order Invoice</h1>
        <div className="flex justify-between text-sm">
          <div>
            <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            {getStatusBadge(order.status || "PENDING")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1">
        {/* Left Column - Customer Info & Items */}
        <div className="lg:col-span-2 space-y-6 print:space-y-4">
          {/* Customer Information Card */}
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{order.customerInfo.name}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{order.customerInfo.email}</span>
                  </div>
                  {order.customerInfo.phone && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{order.customerInfo.phone}</span>
                    </div>
                  )}
                  {order.customerInfo.address && (
                    <div className="flex items-start gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>{order.customerInfo.address}</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Order Date:</span>{" "}
                    {formatDate(order.createdAt)}
                  </p>
                  {order.status && (
                    <p className="mt-2">
                      <span className="font-medium">Status:</span>{" "}
                      {getStatusBadge(order.status)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Table */}
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border print:border-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Promotions</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow
                        key={index}
                        className={item.itemDiscount > 0 ? "bg-green-50/50" : ""}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {item.product.sku}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.appliedPromotions.length > 0 ? (
                              item.appliedPromotions.map((appliedPromo, idx) => {
                                if (promotionData && appliedPromo.title === promotionData.name) {
                                  return (
                                    <PromotionDetails
                                      key={idx}
                                      promotion={promotionData}
                                      discount={appliedPromo.discount}
                                    />
                                  )
                                }
                                return (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {appliedPromo.title}
                                  </Badge>
                                )
                              })
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.itemDiscount > 0 ? (
                            <span className="text-green-600 font-medium">
                              -{formatPrice(item.itemDiscount)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(item.itemTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing Breakdown */}
        <div className="space-y-6 print:space-y-4">
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>

                {order.totalDiscount > 0 && (
                  <div className="space-y-2 border-t pt-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Discount Breakdown:
                    </div>
                    {promotionBreakdown.length > 0 ? (
                      promotionBreakdown.map((promo, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm text-green-600"
                        >
                          <span>{promo.title}</span>
                          <span>-{formatPrice(promo.discount)}</span>
                        </div>
                      ))
                    ) : (
                      order.promotion && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>{order.promotion.name}</span>
                          <span>-{formatPrice(order.totalDiscount)}</span>
                        </div>
                      )
                    )}
                    <div className="flex justify-between text-sm font-medium text-green-600 border-t pt-2">
                      <span>Total Discount</span>
                      <span>-{formatPrice(order.totalDiscount)}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Grand Total</span>
                  <span>{formatPrice(order.grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-8 pt-4 border-t text-xs text-muted-foreground text-center">
        <p>Thank you for your order!</p>
        <p className="mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
      </div>
    </div>
  )
}

