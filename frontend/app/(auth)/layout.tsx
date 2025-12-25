"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // If already authenticated, don't allow access to auth routes
        if (status === "authenticated") {
            router.replace("/dashboard");
        }
    }, [status, router]);

    // Prevent flash of auth content when user is already authenticated
    if (status === "authenticated") {
        return null;
    }

    return children;
}