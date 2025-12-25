import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import StoreProvider from "@/components/provider/StoreProvider";
import AuthProvider from "@/components/provider/AuthProvider";
import { Toaster } from "sonner";
import ConfigLoader from "@/components/provider/ConfigLoader";
import { getAuthSession } from "@/lib/auth";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <AuthProvider session={session}>
            <StoreProvider>
              <ConfigLoader>{children}</ConfigLoader>
            </StoreProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}