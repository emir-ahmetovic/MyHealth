import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { LanguageProvider } from "@/components/shared/language-provider"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import "./globals.css"
import Script from 'next/script'
import { UserProvider } from "@/components/shared/user-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MojeZdravlje | Healthcare Appointments",
  description: "Book appointments with private clinics across Bosnia and Herzegovina",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <LanguageProvider>
            <UserProvider>
              <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              document.body.dataset.newGrCsCheckLoaded = null;
              document.body.dataset.grExtInstalled = null;
            `,
          }}
        />
      </body>
    </html>
  )
}
