"use client"

import * as React from "react"
import { Promotion } from "@/redux/features/promotions/promotionsApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PromotionSelectorProps {
    promotions: Promotion[]
    selectedPromotionId: string | null
    onSelect: (promotionId: string | null) => void
    appliedPromotions: Array<{
        promotion: Promotion
        discount: number
    }>
}

export function PromotionSelector({
    promotions,
    selectedPromotionId,
    onSelect,
    appliedPromotions,
}: PromotionSelectorProps) {
    const applicablePromotionIds = new Set(
        appliedPromotions.map((ap) => ap.promotion.id)
    )

    if (promotions.length === 0) {
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="h-4 w-4" />
                    Apply Promotion
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="promotion-select">Select Promotion Code</Label>
                    <Select
                        value={selectedPromotionId || "none"}
                        onValueChange={(value) => onSelect(value === "none" ? null : value)}
                    >
                        <SelectTrigger id="promotion-select">
                            <SelectValue placeholder="No promotion" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Promotion</SelectItem>
                            {promotions.map((promotion) => {
                                const isApplicable = applicablePromotionIds.has(promotion.id)
                                const appliedPromo = appliedPromotions.find(
                                    (ap) => ap.promotion.id === promotion.id
                                )

                                return (
                                    <SelectItem
                                        key={promotion.id}
                                        value={promotion.id}
                                        disabled={!isApplicable}
                                    >
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <span>
                                                {promotion.name}
                                                {promotion.code && ` (${promotion.code})`}
                                            </span>
                                            {appliedPromo && (
                                                <Badge variant="success" className="text-xs ml-2">
                                                    -৳{appliedPromo.discount.toFixed(2)}
                                                </Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {selectedPromotionId && (
                    <div className="rounded-md bg-muted p-3 space-y-2">
                        {appliedPromotions
                            .filter((ap) => ap.promotion.id === selectedPromotionId)
                            .map((ap) => (
                                <div key={ap.promotion.id} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{ap.promotion.name}</span>
                                        <Badge variant="success" className="text-xs">
                                            -৳{ap.discount.toFixed(2)}
                                        </Badge>
                                    </div>
                                    {ap.promotion.code && (
                                        <p className="text-xs text-muted-foreground">
                                            Code: {ap.promotion.code}
                                        </p>
                                    )}
                                </div>
                            ))}
                        {appliedPromotions.filter((ap) => ap.promotion.id === selectedPromotionId).length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                This promotion is not applicable to items in your cart
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

