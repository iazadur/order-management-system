"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useRegisterMutation } from "@/redux/features/auth/authApi";

/* ======================
   Schema
====================== */

const registerSchema = z
    .object({
        email: z
            .string()
            .min(1, "Email is required")
            .email("Enter a valid email address")
            .transform((v) => v.toLowerCase().trim()),
        password: z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(
                /[^A-Za-z0-9]/,
                "Password must contain at least one special character"
            ),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterValues = z.infer<typeof registerSchema>;

/* ======================
   Password Requirements Component
====================== */

interface PasswordRequirementProps {
    met: boolean;
    label: string;
}

function PasswordRequirement({ met, label }: PasswordRequirementProps) {
    return (
        <div className="flex items-center gap-2 text-sm transition-colors">
            {met ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            ) : (
                <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span
                className={
                    met
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : "text-muted-foreground"
                }
            >
                {label}
            </span>
        </div>
    );
}

/* ======================
   Component
====================== */

export default function RegisterForm() {
    const router = useRouter();
    const [register, { isLoading: isRegistering }] = useRegisterMutation();

    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const password = useWatch({
        control: form.control,
        name: "password",
    });

    // Check password requirements
    const passwordRequirements = {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    };

    const onSubmit = (values: RegisterValues) => {
        setError(null);

        startTransition(async () => {
            try {
                const result = await register({
                    email: values.email,
                    password: values.password,
                }).unwrap();

                if (result.success && result.data) {
                    // Auto-login after successful registration
                    const signInResult = await signIn("credentials", {
                        email: values.email,
                        password: values.password,
                        redirect: false,
                    });

                    if (signInResult?.ok) {
                        router.push("/dashboard");
                        router.refresh();
                    } else {
                        // Registration successful but auto-login failed
                        router.push("/login?registered=true");
                    }
                }
            } catch (err) {
                // RTK Query error structure: { status, data }
                // Normalize error shape
                const normalizedError = err && typeof err === 'object' && 'status' in err
                    ? err
                    : err && typeof err === 'object' && 'error' in err
                        ? (err as { error: { status?: number; data?: unknown } }).error
                        : null;

                if (normalizedError && 'data' in normalizedError) {
                    const errorData = normalizedError.data as {
                        error?: string;
                        details?: Array<{ message: string }>
                    };

                    if (errorData?.error) {
                        if (errorData.error === "User with this email already exists") {
                            setError("An account with this email already exists. Please sign in instead.");
                        } else if (errorData.details && Array.isArray(errorData.details)) {
                            // Validation errors from backend
                            const validationErrors = errorData.details
                                .map((detail) => detail.message)
                                .join(", ");
                            setError(validationErrors);
                        } else {
                            setError(errorData.error || "Registration failed. Please try again.");
                        }
                    } else {
                        setError("Registration failed. Please try again.");
                    }
                } else {
                    setError("An unexpected error occurred. Please try again.");
                }
            }
        });
    };

    const isLoading = isPending || isRegistering;

    return (
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter:blur(10px)]:bg-background/60">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-3xl font-bold tracking-tight">
                    Create an account
                </CardTitle>
                <CardDescription className="text-base">
                    Enter your information to get started
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-5"
                        noValidate
                    >
                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Email address
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                disabled={isLoading}
                                                aria-invalid={!!form.formState.errors.email}
                                                className="pl-10 h-11"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a strong password"
                                                autoComplete="new-password"
                                                disabled={isLoading}
                                                aria-invalid={!!form.formState.errors.password}
                                                className="pl-10 pr-10 h-11"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                disabled={isLoading}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    {password && (
                                        <FormDescription>
                                            <div className="mt-3 space-y-2 rounded-lg bg-muted/50 p-3 animate-in fade-in slide-in-from-top-2">
                                                <PasswordRequirement
                                                    met={passwordRequirements.minLength}
                                                    label="At least 8 characters"
                                                />
                                                <PasswordRequirement
                                                    met={passwordRequirements.hasUpperCase}
                                                    label="One uppercase letter"
                                                />
                                                <PasswordRequirement
                                                    met={passwordRequirements.hasLowerCase}
                                                    label="One lowercase letter"
                                                />
                                                <PasswordRequirement
                                                    met={passwordRequirements.hasNumber}
                                                    label="One number"
                                                />
                                                <PasswordRequirement
                                                    met={passwordRequirements.hasSpecialChar}
                                                    label="One special character"
                                                />
                                            </div>
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                        Confirm Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                autoComplete="new-password"
                                                disabled={isLoading}
                                                aria-invalid={!!form.formState.errors.confirmPassword}
                                                className="pl-10 pr-10 h-11"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                disabled={isLoading}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Server Error */}
                        {error && (
                            <div
                                role="alert"
                                className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive dark:bg-destructive/20 animate-in fade-in slide-in-from-top-2"
                            >
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">{error}</div>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create account"
                            )}
                        </Button>
                    </form>
                </Form>

                {/* Dummy User Card */}
                <div className="mt-4 pt-4 border-t">
                    <div
                        onClick={() => {
                            if (!isLoading) {
                                form.setValue("email", "iamazadur0@gmail.com");
                                form.setValue("password", "Asdf@123");
                                form.setValue("confirmPassword", "Asdf@123");
                            }
                        }}
                        className="cursor-pointer rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Quick Fill (Demo)
                                </p>
                                <div className="text-sm space-y-0.5">
                                    <p className="font-mono text-xs">
                                        <span className="text-muted-foreground">Email:</span>{" "}
                                        <span className="font-semibold">iamazadur0@gmail.com</span>
                                    </p>
                                    <p className="font-mono text-xs">
                                        <span className="text-muted-foreground">Password:</span>{" "}
                                        <span className="font-semibold">Asdf@123</span>
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-8 text-xs"
                                disabled={isLoading}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isLoading) {
                                        form.setValue("email", "iamazadur0@gmail.com");
                                        form.setValue("password", "Asdf@123");
                                        form.setValue("confirmPassword", "Asdf@123");
                                    }
                                }}
                            >
                                Fill
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
                <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-primary hover:underline transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}

