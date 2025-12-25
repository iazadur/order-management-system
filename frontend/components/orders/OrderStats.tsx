"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, DollarSign, TrendingUp, Calendar } from "lucide-react"
import { OrderStats as OrderStatsType } from "@/redux/features/orders/ordersApi"
import { formatPrice } from "@/lib/utils"

interface OrderStatsProps {
  stats: OrderStatsType | undefined
  isLoading?: boolean
}

export function OrderStats({ stats, isLoading }: OrderStatsProps) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statsCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: Package,
      description: "All time",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      description: "All time",
    },
    {
      title: "Average Order Value",
      value: formatPrice(stats.averageOrderValue),
      icon: TrendingUp,
      description: "Per order",
    },
    {
      title: "Today's Orders",
      value: stats.todaysOrders.toLocaleString(),
      icon: Calendar,
      description: `Revenue: ${formatPrice(stats.todaysRevenue)}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

