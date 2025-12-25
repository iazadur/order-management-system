"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreatePromotionMutation } from "@/redux/features/promotions/promotionsApi"
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
import { SlabBuilder } from "./SlabBuilder"

const slabSchema = z.object({
  minWeight: z
    .number()
    .int("Min weight must be an integer")
    .nonnegative("Min weight must be non-negative"),
  maxWeight: z
    .number()
    .int("Max weight must be an integer")
    .positive("Max weight must be positive"),
  discountPerUnit: z.number().positive("Discount per unit must be positive"),
}).refine(
  (data) => data.minWeight < data.maxWeight,
  {
    message: "Min weight must be less than max weight",
    path: ["maxWeight"],
  }
)

const createPromotionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  type: z.enum(["PERCENTAGE", "FIXED", "WEIGHTED"]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isEnabled: z.boolean(),
  slabs: z.array(slabSchema).optional(),
  percentageValue: z.number().positive().optional(),
  fixedValue: z.number().positive().optional(),
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
).refine(
  (data) => {
    if (data.type === "WEIGHTED" && (!data.slabs || data.slabs.length === 0)) {
      return false
    }
    return true
  },
  {
    message: "Slabs are required for WEIGHTED promotion type",
    path: ["slabs"],
  }
).refine(
  (data) => {
    if (data.type === "PERCENTAGE" && !data.percentageValue) {
      return false
    }
    return true
  },
  {
    message: "Percentage value is required for PERCENTAGE promotion type",
    path: ["percentageValue"],
  }
).refine(
  (data) => {
    if (data.type === "FIXED" && !data.fixedValue) {
      return false
    }
    return true
  },
  {
    message: "Fixed value is required for FIXED promotion type",
    path: ["fixedValue"],
  }
).refine(
  (data) => {
    if (data.type === "WEIGHTED" && data.slabs) {
      // Check for overlapping ranges
      const sortedSlabs = [...data.slabs].sort((a, b) => a.minWeight - b.minWeight)
      for (let i = 0; i < sortedSlabs.length - 1; i++) {
        if (sortedSlabs[i].maxWeight >= sortedSlabs[i + 1].minWeight) {
          return false
        }
      }
    }
    return true
  },
  {
    message: "Slab ranges cannot overlap",
    path: ["slabs"],
  }
)

type CreatePromotionFormValues = z.infer<typeof createPromotionSchema>

interface CreatePromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePromotionDialog({ open, onOpenChange }: CreatePromotionDialogProps) {
  const [createPromotion, { isLoading }] = useCreatePromotionMutation()
  const [step, setStep] = React.useState(1)

  const form = useForm<CreatePromotionFormValues>({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: {
      title: "",
      type: "PERCENTAGE",
      startDate: null,
      endDate: null,
      isEnabled: true,
      slabs: [],
      percentageValue: undefined,
      fixedValue: undefined,
    },
  })

  const watchedType = form.watch("type")

  React.useEffect(() => {
    if (!open) {
      form.reset()
      setStep(1)
    }
  }, [open, form])

  const onSubmit = async (data: CreatePromotionFormValues) => {
    try {
      // Format dates as ISO strings
      const payload = {
        ...data,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      }

      await createPromotion(payload).unwrap()
      form.reset()
      setStep(1)
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      // Error toast is handled in the mutation's onQueryStarted
    }
  }

  const handleNext = async () => {
    const isValid = await form.trigger(["title", "type", "startDate", "endDate"])
    if (isValid && watchedType === "WEIGHTED") {
      setStep(2)
    } else if (isValid) {
      // For PERCENTAGE and FIXED, validate their specific fields
      if (watchedType === "PERCENTAGE") {
        const percentageValid = await form.trigger("percentageValue")
        if (percentageValid) {
          await onSubmit(form.getValues())
        }
      } else if (watchedType === "FIXED") {
        const fixedValid = await form.trigger("fixedValue")
        if (fixedValid) {
          await onSubmit(form.getValues())
        }
      }
    }
  }

  const handleBack = () => {
    setStep(1)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Create Promotion - Basic Info" : "Create Promotion - Slabs"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Fill in the basic information for your promotion."
              : "Define weight-based discount slabs for your promotion."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 ? (
              <>
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
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="PERCENTAGE">Percentage</option>
                          <option value="FIXED">Fixed</option>
                          <option value="WEIGHTED">Weighted</option>
                        </select>
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
                {watchedType === "PERCENTAGE" && (
                  <FormField
                    control={form.control}
                    name="percentageValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentage Value (%) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="10.00"
                            disabled={isLoading}
                            aria-label="Percentage value"
                            aria-required="true"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {watchedType === "FIXED" && (
                  <FormField
                    control={form.control}
                    name="fixedValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fixed Value (৳) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="5.00"
                            disabled={isLoading}
                            aria-label="Fixed value"
                            aria-required="true"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            ) : (
              <SlabBuilder disabled={isLoading} />
            )}
            <DialogFooter>
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              {step === 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  {watchedType === "WEIGHTED" ? "Next" : "Create"}
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Promotion"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

