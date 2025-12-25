"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Download, X } from "lucide-react"
import { OrderListParams } from "@/redux/features/orders/ordersApi"

interface OrderFiltersProps {
  filters: OrderListParams
  onFiltersChange: (filters: OrderListParams) => void
  onExport?: () => void
}

export function OrderFilters({ filters, onFiltersChange, onExport }: OrderFiltersProps) {
  const [localFilters, setLocalFilters] = React.useState<OrderListParams>(filters)

  React.useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof OrderListParams, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value || undefined }
    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
  }

  const handleResetFilters = () => {
    const resetFilters: OrderListParams = {
      page: 1,
      limit: 10,
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const hasActiveFilters = Boolean(
    localFilters.status ||
    localFilters.startDate ||
    localFilters.endDate ||
    localFilters.customerSearch
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Customer Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or email..."
                value={localFilters.customerSearch || ""}
                onChange={(e) => handleFilterChange("customerSearch", e.target.value)}
                className="pl-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApplyFilters()
                  }
                }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select
            value={localFilters.status || "all"}
            onValueChange={(value) =>
              handleFilterChange("status", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="FULFILLED">Fulfilled</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Start Date */}
          <Input
            type="date"
            placeholder="Start Date"
            value={localFilters.startDate || ""}
            onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
            className="w-full"
          />

          {/* End Date */}
          <Input
            type="date"
            placeholder="End Date"
            value={localFilters.endDate || ""}
            onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} size="sm">
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button onClick={handleResetFilters} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
          {onExport && (
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

