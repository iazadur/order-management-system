"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useUpdatePromotionMutation } from "@/redux/features/promotions/promotionsApi"
import { Promotion } from "@/redux/features/promotions/promotionsApi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const updatePromotionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return start < end
    }
    return true
  },
  {
    message: "Start date must be before end date",
    path: ["endDate"],
  }
)

type UpdatePromotionFormValues = z.infer<typeof updatePromotionSchema>

interface EditPromotionDialogProps {
  promotion: Promotion | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPromotionDialog({ promotion, open, onOpenChange }: EditPromotionDialogProps) {
  const [updatePromotion, { isLoading }] = useUpdatePromotionMutation()

  const form = useForm<UpdatePromotionFormValues>({
    resolver: zodResolver(updatePromotionSchema),
    defaultValues: {
      title: "",
      startDate: null,
      endDate: null,
    },
  })

  React.useEffect(() => {
    if (promotion && open) {
      form.reset({
        title: promotion.name,
        startDate: promotion.startDate || null,
        endDate: promotion.endDate || null,
      })
    }
  }, [promotion, open, form])

  const onSubmit = async (data: UpdatePromotionFormValues) => {
    if (!promotion) return

    try {
      await updatePromotion({
        id: promotion.id,
        data: {
          ...data,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
        },
      }).unwrap()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      // Error toast is handled in the mutation's onQueryStarted
    }
  }

  const formatDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const parseDateTimeLocal = (value: string) => {
    if (!value) return null
    return new Date(value).toISOString()
  }

  if (!promotion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Promotion</DialogTitle>
          <DialogDescription>
            Update promotion information. Only title and dates can be modified.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Type and slabs cannot be modified after creation.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <FormLabel>Type</FormLabel>
              <div>
                <Badge variant="outline">{promotion.type}</Badge>
              </div>
            </div>

            {promotion.type === "WEIGHTED" && promotion.slabs && promotion.slabs.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Slabs</FormLabel>
                <div className="rounded-md border p-3 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    {promotion.slabs.length} slab{promotion.slabs.length !== 1 ? "s" : ""} configured
                  </p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Promotion title"
                      disabled={isLoading}
                      aria-label="Promotion title"
                      aria-required="true"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={isLoading}
                        aria-label="Start date"
                        value={formatDateTimeLocal(field.value || null)}
                        onChange={(e) => field.onChange(parseDateTimeLocal(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={isLoading}
                        aria-label="End date"
                        value={formatDateTimeLocal(field.value || null)}
                        onChange={(e) => field.onChange(parseDateTimeLocal(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Promotion"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

