"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    X,
    Building2,
    ChevronDown,
    ChevronRight,
    ShoppingCart,
    LucideIcon,
    Tag,
    Package,
} from "lucide-react";
import { useState } from "react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Promotions", href: "/dashboard/promotions", icon: Tag },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {

    const [expandedItems, setExpandedItems] = useState<string[]>(["Dashboard"]);
    const pathname = usePathname();

    const toggleExpanded = (itemName: string) => {
        setExpandedItems((prev) =>
            prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName]
        );
    };

    const isExpanded = (itemName: string) => expandedItems.includes(itemName);

    return (
        <>
            {/* Mobile sidebar overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 backdrop-blur-sm  bg-opacity-50 lg:hidden"
                    onClick={onClose}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") onClose();
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full flex flex-col w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl lg:shadow-none",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 bg-linear-to-r from-blue-600 to-purple-600">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <Building2 className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm group-hover:blur-none transition-all duration-300" />
                        </div>
                        <span className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors">OMS Admin</span>
                    </Link>
                    <Button variant="ghost" size="sm" className="lg:hidden text-white hover:bg-white/20" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-2">
                        {navigation.map((item: { name: string; href: string; icon: LucideIcon; children?: { name: string; href: string }[] }) => (
                            <li key={item.name}>
                                <div className="relative">
                                    {item?.children ? (
                                        <button
                                            type="button"
                                            onClick={() => toggleExpanded(item.name)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group",
                                                pathname.startsWith(item.href)
                                                    ? "bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md"
                                            )}
                                        >
                                            <div className="flex items-center">
                                                <item.icon
                                                    className={cn(
                                                        "mr-3 h-5 w-5 transition-colors",
                                                        pathname.startsWith(item.href)
                                                            ? "text-white"
                                                            : "text-gray-500 group-hover:text-gray-700"
                                                    )}
                                                />
                                                {item.name}
                                            </div>
                                            {isExpanded(item.name) ? (
                                                <ChevronDown className="h-4 w-4 transition-transform duration-300" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 transition-transform duration-300" />
                                            )}
                                        </button>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            onClick={() => window.innerWidth < 1024 && onClose()}
                                            className={cn(
                                                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group hover:scale-105",
                                                pathname === item.href
                                                    ? "bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md"
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    "mr-3 h-5 w-5 transition-colors",
                                                    pathname === item.href ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                                                )}
                                            />
                                            {item.name}
                                        </Link>
                                    )}
                                </div>

                                {/* Submenu */}
                                {item?.children && (
                                    <div
                                        className={cn(
                                            "mt-2 ml-4 space-y-1 transition-all duration-300 overflow-hidden",
                                            isExpanded(item.name) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                        )}
                                    >
                                        {item?.children?.map((child: { name: string; href: string }) => (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                onClick={() => window.innerWidth < 1024 && onClose()}
                                                className={cn(
                                                    "flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-300 group hover:translate-x-2",
                                                    pathname === child.href
                                                        ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-500"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                )}
                                            >
                                                <div className="w-2 h-2 rounded-full bg-gray-300 mr-3 group-hover:bg-blue-500 transition-colors" />
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

            </aside>
        </>
    );
}