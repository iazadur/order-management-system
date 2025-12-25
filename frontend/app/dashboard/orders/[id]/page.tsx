import type { Metadata } from "next";
import { OrderDetails } from "@/components/orders/OrderDetails"

export const metadata: Metadata = {
  title: "Order Details | Dashboard",
  description: "View the details of an order",
  keywords: ["order details", "dashboard", "order", "details"],
}

export default function OrderDetailsPage() {
  return <OrderDetails />
}

