"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/* ======================
   Schema
====================== */

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address")
        .transform((v) => v.toLowerCase().trim()),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

/* ======================
   Component
====================== */

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (values: LoginValues) => {
        setError(null);

        startTransition(async () => {
            try {
                const result = await signIn("credentials", {
                    email: values.email,
                    password: values.password,
                    redirect: false,
                    callbackUrl,
                });

                if (!result) {
                    setError("Something went wrong. Please try again.");
                    return;
                }

                if (result.error) {
                    setError("Invalid email or password. Please check your credentials and try again.");
                    return;
                }

                router.replace(callbackUrl);
                router.refresh();
            } catch {
                setError("An unexpected error occurred. Please try again.");
            }
        });
    };

    return (
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter:blur(10px)]:bg-background/60">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-3xl font-bold tracking-tight">
                    Welcome back
                </CardTitle>
                <CardDescription className="text-base">
                    Sign in to your account to continue
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
                                                disabled={isPending}
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
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                disabled={isPending}
                                                aria-invalid={!!form.formState.errors.password}
                                                className="pl-10 pr-10 h-11"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                disabled={isPending}
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
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>
                </Form>

                {/* Dummy User Card */}
                <div className="mt-4 pt-4 border-t">
                    <div
                        onClick={() => {
                            if (!isPending) {
                                form.setValue("email", "iamazadur0@gmail.com");
                                form.setValue("password", "Asdf@123");
                            }
                        }}
                        className="cursor-pointer rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Quick Login (Demo)
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
                                disabled={isPending}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isPending) {
                                        form.setValue("email", "iamazadur0@gmail.com");
                                        form.setValue("password", "Asdf@123");
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
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-primary hover:underline transition-colors"
                    >
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}

