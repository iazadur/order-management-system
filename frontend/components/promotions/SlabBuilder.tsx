"use client"

import * as React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { Plus, Trash2, AlertCircle, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreateSlabDto } from "@/redux/features/promotions/promotionsApi"

interface SlabBuilderProps {
  name?: string // Field array name, defaults to "slabs"
  disabled?: boolean
}

export function SlabBuilder({ name = "slabs", disabled = false }: SlabBuilderProps) {
  const form = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  })

  const watchedSlabs = form.watch(name) as CreateSlabDto[]

  // Validate slabs for overlaps and gaps
  const validateSlabs = React.useCallback((slabs: CreateSlabDto[]): {
    isValid: boolean
    errors: Map<number, string[]>
  } => {
    const errors = new Map<number, string[]>()
    
    if (!slabs || slabs.length === 0) {
      return { isValid: false, errors }
    }

    // Sort slabs by minWeight
    const sortedSlabs = [...slabs]
      .map((slab, index) => ({ ...slab, originalIndex: index }))
      .sort((a, b) => a.minWeight - b.minWeight)

    sortedSlabs.forEach((slab, sortedIndex) => {
      const originalIndex = (slab as any).originalIndex
      const slabErrors: string[] = []

      // Validate individual slab fields
      if (slab.minWeight >= slab.maxWeight) {
        slabErrors.push("Min weight must be less than max weight")
      }

      if (slab.minWeight < 0) {
        slabErrors.push("Min weight cannot be negative")
      }

      if (slab.maxWeight <= 0) {
        slabErrors.push("Max weight must be positive")
      }

      if (slab.discountPerUnit <= 0) {
        slabErrors.push("Discount per unit must be positive")
      }

      // Check for overlaps with other slabs
      sortedSlabs.forEach((otherSlab, otherSortedIndex) => {
        const otherOriginalIndex = (otherSlab as any).originalIndex
        if (originalIndex !== otherOriginalIndex) {
          // Check if ranges overlap
          if (
            (slab.minWeight < otherSlab.maxWeight && slab.maxWeight > otherSlab.minWeight)
          ) {
            slabErrors.push(
              `Overlaps with slab ${otherOriginalIndex + 1} (${otherSlab.minWeight}-${otherSlab.maxWeight}g)`
            )
          }
        }
      })

      if (slabErrors.length > 0) {
        errors.set(originalIndex, slabErrors)
      }
    })

    return {
      isValid: errors.size === 0,
      errors,
    }
  }, [])

  const validationResult = React.useMemo(() => {
    return validateSlabs(watchedSlabs || [])
  }, [watchedSlabs, validateSlabs])

  const addSlab = () => {
    // Find the highest maxWeight to suggest next range
    const maxMaxWeight = watchedSlabs?.length
      ? Math.max(...watchedSlabs.map((s) => s.maxWeight || 0))
      : 0

    append({
      minWeight: maxMaxWeight,
      maxWeight: maxMaxWeight + 100,
      discountPerUnit: 0,
    })
  }

  const removeSlab = (index: number) => {
    remove(index)
  }

  const sortSlabs = () => {
    if (!watchedSlabs || watchedSlabs.length === 0) return
    
    const sorted = [...watchedSlabs].sort((a, b) => a.minWeight - b.minWeight)
    form.setValue(name, sorted, { shouldValidate: true })
  }

  // Check if slabs are sorted
  const isSorted = React.useMemo(() => {
    if (!watchedSlabs || watchedSlabs.length <= 1) return true
    for (let i = 1; i < watchedSlabs.length; i++) {
      if (watchedSlabs[i - 1].minWeight > watchedSlabs[i].minWeight) {
        return false
      }
    }
    return true
  }, [watchedSlabs])

  if (!fields || fields.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No slabs defined. Add at least one slab to create a weighted promotion.
          </AlertDescription>
        </Alert>
        <Button
          type="button"
          variant="outline"
          onClick={addSlab}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Slab
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <Alert className="flex-1">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Define weight ranges and their corresponding discounts. Ranges cannot overlap.
            {!isSorted && " Slabs should be sorted by minimum weight."}
          </AlertDescription>
        </Alert>
        {!isSorted && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={sortSlabs}
            disabled={disabled}
            className="shrink-0"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort by Min Weight
          </Button>
        )}
      </div>

      {fields.map((field, index) => {
        const slabErrors = validationResult.errors.get(index) || []
        const hasErrors = slabErrors.length > 0

        return (
          <div
            key={field.id}
            className={`rounded-lg border p-4 space-y-4 ${
              hasErrors ? "border-destructive bg-destructive/5" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Slab {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSlab(index)}
                disabled={disabled || fields.length === 1}
                aria-label={`Remove slab ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {hasErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {slabErrors.map((error, errorIndex) => (
                      <li key={errorIndex} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`${name}.${index}.minWeight`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Weight (g) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        disabled={disabled}
                        aria-label={`Min weight for slab ${index + 1}`}
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0
                          field.onChange(value)
                          // Trigger validation
                          form.trigger(`${name}.${index}`)
                        }}
                        className={hasErrors ? "border-destructive" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${name}.${index}.maxWeight`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Weight (g) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        disabled={disabled}
                        aria-label={`Max weight for slab ${index + 1}`}
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0
                          field.onChange(value)
                          // Trigger validation
                          form.trigger(`${name}.${index}`)
                        }}
                        className={hasErrors ? "border-destructive" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${name}.${index}.discountPerUnit`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount/Unit (৳) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        disabled={disabled}
                        aria-label={`Discount per unit for slab ${index + 1}`}
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0
                          field.onChange(value)
                          // Trigger validation
                          form.trigger(`${name}.${index}`)
                        }}
                        className={hasErrors ? "border-destructive" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        onClick={addSlab}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Slab
      </Button>

      {validationResult.errors.size > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the validation errors above before submitting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

