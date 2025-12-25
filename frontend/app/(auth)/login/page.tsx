import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
    title: "Sign In | Authentication",
    description: "Sign in to your account to access the dashboard and manage your orders, products, and promotions.",
    keywords: ["login", "sign in", "authentication", "account access"],
    openGraph: {
        title: "Sign In | Authentication",
        description: "Sign in to your account to access the dashboard and manage your orders, products, and promotions.",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Sign In | Authentication",
        description: "Sign in to your account to access the dashboard and manage your orders, products, and promotions.",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-300 via-white to-zinc-100 p-4 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <LoginForm />
            </div>
        </div>
    );
}
