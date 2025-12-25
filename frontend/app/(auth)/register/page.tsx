import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign Up | Create Account",
  description: "Create a new account to get started. Sign up to access the dashboard and manage your orders, products, and promotions.",
  keywords: ["sign up", "register", "create account", "new account", "authentication"],
  openGraph: {
    title: "Sign Up | Create Account",
    description: "Create a new account to get started. Sign up to access the dashboard and manage your orders, products, and promotions.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sign Up | Create Account",
    description: "Create a new account to get started. Sign up to access the dashboard and manage your orders, products, and promotions.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-300 via-white to-zinc-100 p-4 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <RegisterForm />
      </div>
    </div>
  );
}
