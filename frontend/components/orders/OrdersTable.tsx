"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Order } from "@/redux/features/orders/ordersApi"
import { formatPrice } from "@/lib/utils"

interface OrdersTableProps {
  orders: Order[]
  isLoading?: boolean
  sortBy?: "createdAt" | "grandTotal"
  sortOrder?: "asc" | "desc"
  onSortChange?: (sortBy: "createdAt" | "grandTotal", sortOrder: "asc" | "desc") => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function OrdersTable({
  orders,
  isLoading,
  sortBy = "createdAt",
  sortOrder = "desc",
  onSortChange,
  currentPage,
  totalPages,
  onPageChange,
}: OrdersTableProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const handleSort = (column: "createdAt" | "grandTotal") => {
    if (onSortChange) {
      const newOrder =
        sortBy === column && sortOrder === "asc" ? "desc" : "asc"
      onSortChange(column, newOrder)
    }
  }

  const getSortIcon = (column: "createdAt" | "grandTotal") => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 -ml-3"
                  onClick={() => handleSort("createdAt")}
                >
                  Date
                  {getSortIcon("createdAt")}
                </Button>
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 -ml-3"
                  onClick={() => handleSort("grandTotal")}
                >
                  Total
                  {getSortIcon("grandTotal")}
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  {order.id.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customerInfo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerInfo.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {order.items.length}
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(order.grandTotal)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.status || "PENDING")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

