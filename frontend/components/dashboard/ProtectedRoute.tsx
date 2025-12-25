"use client";

/**
 * Client component that protects routes from unauthenticated users.
 * - Redirects unauthenticated users to /login
 * - Renders children only when the user is authenticated
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // If not authenticated, redirect to login
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    // Show loading while checking authentication
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Don't render anything if not authenticated (will redirect)
    if (status === "unauthenticated") {
        return null;
    }

    // User is authenticated, allow rendering of protected content
    return <>{children}</>;
}