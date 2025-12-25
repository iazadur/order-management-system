"use client"

import * as React from "react"
import { useGetOrdersQuery, useGetOrderStatsQuery, OrderListParams } from "@/redux/features/orders/ordersApi"
import { OrderFilters } from "@/components/orders/OrderFilters"
import { OrdersTable } from "@/components/orders/OrdersTable"
import { OrderStats } from "@/components/orders/OrderStats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

const ITEMS_PER_PAGE = 10

export default function OrdersManagementPage() {
  const [filters, setFilters] = React.useState<OrderListParams>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery(filters)
  const { data: stats, isLoading: statsLoading } = useGetOrderStatsQuery()

  // Calculate pagination 
  const { orders } = useMemo(() => {
    const orders = ordersData?.orders || []
    const totalOrders = ordersData?.total || 0
    const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE)
    return { orders, totalPages }
  }, [ordersData])


  const currentPage = filters.page || 1

  // Apply frontend filtering and sorting since backend doesn't support it yet
  const filteredAndSortedOrders = React.useMemo(() => {
    let result = [...orders]

    // Filter by status
    if (filters.status) {
      result = result.filter((order) => order.status === filters.status)
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate)
      result = result.filter((order) => new Date(order.createdAt) >= startDate)
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate)
      endDate.setHours(23, 59, 59, 999)
      result = result.filter((order) => new Date(order.createdAt) <= endDate)
    }

    // Filter by customer search
    if (filters.customerSearch) {
      const searchLower = filters.customerSearch.toLowerCase()
      result = result.filter(
        (order) =>
          order.customerInfo.name.toLowerCase().includes(searchLower) ||
          order.customerInfo.email.toLowerCase().includes(searchLower)
      )
    }

    // Sort
    const sortBy = filters.sortBy || "createdAt"
    const sortOrder = filters.sortOrder || "desc"
    result.sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      if (sortBy === "createdAt") {
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
      } else {
        aValue = a.grandTotal
        bValue = b.grandTotal
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return result
  }, [orders, filters.status, filters.startDate, filters.endDate, filters.customerSearch, filters.sortBy, filters.sortOrder])

  // Paginate
  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAndSortedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredAndSortedOrders, currentPage])

  const handleFiltersChange = (newFilters: OrderListParams) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handleSortChange = (sortBy: "createdAt" | "grandTotal", sortOrder: "asc" | "desc") => {
    setFilters({ ...filters, sortBy, sortOrder })
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const handleExportCSV = () => {
    // Calculate stats for export
    const totalRevenue = filteredAndSortedOrders.reduce((sum, order) => sum + order.grandTotal, 0)
    const avgOrderValue = filteredAndSortedOrders.length > 0
      ? totalRevenue / filteredAndSortedOrders.length
      : 0

    // Create CSV content
    const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Items Count", "Subtotal", "Discount", "Total", "Status"]
    const rows = filteredAndSortedOrders.map((order) => [
      order.id,
      new Date(order.createdAt).toISOString(),
      order.customerInfo.name,
      order.customerInfo.email,
      order.items.length.toString(),
      `৳${(order.subtotal / 100).toFixed(2)}`,
      `৳${(order.totalDiscount / 100).toFixed(2)}`,
      `৳${(order.grandTotal / 100).toFixed(2)}`,
      order.status || "PENDING",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      "",
      `Total Orders,${filteredAndSortedOrders.length}`,
      `Total Revenue,৳${(totalRevenue / 100).toFixed(2)}`,
      `Average Order Value,৳${(avgOrderValue / 100).toFixed(2)}`,
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `orders-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate stats from filtered orders if backend stats not available
  const displayStats = React.useMemo(() => {
    if (stats) return stats

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaysOrders = filteredAndSortedOrders.filter(
      (order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= today && orderDate < tomorrow
      }
    )

    const totalRevenue = filteredAndSortedOrders.reduce((sum, order) => sum + order.grandTotal, 0)
    const averageOrderValue = filteredAndSortedOrders.length > 0
      ? totalRevenue / filteredAndSortedOrders.length
      : 0
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.grandTotal, 0)

    return {
      totalOrders: filteredAndSortedOrders.length,
      totalRevenue,
      averageOrderValue,
      todaysOrders: todaysOrders.length,
      todaysRevenue,
    }
  }, [stats, filteredAndSortedOrders])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all orders
        </p>
      </div> */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all orders
          </p>
        </div>
        {/* Link to create order page */}
        <Link href="/dashboard/orders/new">
          <Button
            aria-label="Add new order"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Add Order
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <OrderStats stats={displayStats} isLoading={statsLoading} />

      {/* Filters */}
      <OrderFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExportCSV}
      />

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable
            orders={paginatedOrders}
            isLoading={ordersLoading}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={handleSortChange}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredAndSortedOrders.length / ITEMS_PER_PAGE)}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}

