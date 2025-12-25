import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency in BDT (Bangladeshi Taka)
 * @param amount - Amount in BDT (Taka)
 * @returns Formatted string with ৳ symbol
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format price in BDT (Bangladeshi Taka) - alias for formatCurrency
 * @param amount - Amount in BDT (Taka)
 * @returns Formatted string with ৳ symbol
 */
export function formatPrice(amount: number): string {
  return formatCurrency(amount);
}


// Error Handling Utils
export const errorHandler = (err: any) => {
  // Normalize RTK Query error shapes: either { status, data } or { error: { status, data } }
  const normalizedError = err?.status ? err : err?.error ? err.error : err;
  const { status, data, message } = normalizedError || {};

  // Handle 422 validation errors or 500 errors with validation-like structure
  if ((status === 422 || status === 500) && data && data.errors) {
    const { message, errors } = data;
    if (errors && Array.isArray(errors)) {
      errors.slice(0, 5).forEach((error: string) => {
        toast.error(message ?? "", {
          description: error,
        });
      });
    } else if (errors && typeof errors === "object") {
      Object.entries(errors).forEach(([field, msgs]) => {
        if (Array.isArray(msgs)) {
          msgs.slice(0, 5).forEach((msg: string) =>
            toast.error(message ?? "", {
              description: msg,
            })
          );
        }
      });
    } else {
      toast.error(message ?? "An unexpected error occurred.");
    }
  }
  // Handle 500 errors where message contains validation errors as object
  else if (status === 500 && data && data.message && typeof data.message === "object") {
    const messageObj = data.message;
    Object.entries(messageObj).forEach(([field, msgs]) => {
      if (Array.isArray(msgs)) {
        msgs.forEach((msg) =>
          toast.error("Validation Error", {
            description: msg + ` Row No: ${field}`,
          })
        );
      }
    });
  }
  // Handle 403
  else if (status === 403) {
    toast.error("You are not authorized to access this resource.");
  }
  // Handle 401
  else if (status === 401) {
    toast.error("You are not authorized to access this resource.");
  }
  // Handle 404
  else if (status === 404) {
    toast.error("The resource you are looking for does not exist.");
  } else {
    // Prefer server-provided message if available
    const serverMessage = typeof data === "string" ? data : data && data.message ? data.message : undefined;
    toast.error(serverMessage ?? message ?? "An unexpected error occurred.");
  }
};

export const successHandler = (res: any) => {
  if (res && res.data && res.data.success) {
    toast.success(res.data.message);
  } else if (res && res.data && !res.data.success) {
    toast.error(res.data.message);
  }
};