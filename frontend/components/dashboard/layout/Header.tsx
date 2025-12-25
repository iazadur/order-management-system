"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Home } from "lucide-react";
import { signOut } from "next-auth/react";
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import { useEffect } from "react";
import { useState } from "react";
import { errorHandler } from "@/lib/utils";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 100);
    }, []);

    const [logout] = useLogoutMutation();
    const handleLogout = async () => {
        await logout().unwrap().then(() => {
            signOut({ callbackUrl: "/" });
        }).catch((error) => {
            errorHandler(error);
        });
    };
    return (
        <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden hover:bg-gray-100 transition-colors cursor-pointer duration-200 ease-linear"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>


                </div>

                {/* Right side */}
                <div className="flex items-center space-x-3">


                    {/* Logout */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-gray-50 transition-colors cursor-pointer duration-200 ease-linear"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>

                    {/* Back to website */}
                    <Link href="/">
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden sm:flex hover:bg-gray-50 transition-colors cursor-pointer duration-200 ease-linear"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Back to Website
                        </Button>
                    </Link>

                    {/* Mobile back button */}
                    <Link href="/">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="sm:hidden hover:bg-gray-100 transition-colors cursor-pointer duration-200 ease-linear"
                        >
                            <Home className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}