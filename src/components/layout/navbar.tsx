"use client"

import { useState } from "react"
import { useUser } from "@/components/shared/user-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTranslation } from "@/components/shared/language-provider"
import { Menu, Globe } from "lucide-react"
import { type LanguageCode } from "@/types/language"

const languages: Array<{ code: LanguageCode; label: string }> = [
  { code: "bs", label: "Bosanski" },
  { code: "sr", label: "Српски" },
  { code: "hr", label: "Hrvatski" },
  { code: "en", label: "English" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { t, language, setLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    { href: "/", label: t("nav.home") },
    { href: "/clinics", label: t("nav.clinics") },
  ]

  const { user, setUser, loading } = useUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white">MZ</div>
            <span className="text-xl font-semibold">MojeZdravlje</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                  pathname === route.href ? "text-teal-500" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-teal-500 dark:text-slate-400">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? "bg-muted font-medium text-teal-500" : ""}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="hidden md:flex md:gap-2">
            {!loading && user ? (
              <>
                <Link href={user.role === "CLINIC" ? "/clinic-dashboard" : "/dashboard"}>
                  <Button variant="ghost">{user.role === "CLINIC" ? "Kontrolna ploča" : "Dashboard"}</Button>
                </Link>
                {user.role === "CLINIC" && (
                  <Link href="/clinic-dashboard/calendar">
                    <Button variant="ghost">Kalendar</Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={() => {
                  fetch("/api/logout", { method: "POST" })
                  setUser(null)
                }}>
                  Odjava
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">{t("nav.login")}</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-teal-500 hover:bg-teal-600">{t("nav.register")}</Button>
                </Link>
              </>
            )}
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="grid gap-6 text-lg font-medium">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`hover:text-teal-500 ${
                      pathname === route.href ? "text-teal-500" : "text-slate-600 dark:text-slate-400"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
                {!loading && user ? (
                  <>
                    <Link
                      href={user.role === "CLINIC" ? "/clinic-dashboard" : "/dashboard"}
                      className="text-slate-600 hover:text-teal-500 dark:text-slate-400"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      className="text-left text-slate-600 hover:text-teal-500 dark:text-slate-400"
                      onClick={() => {
                        fetch("/api/auth/logout", { method: "POST" })
                        setUser(null)
                        setIsOpen(false)
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-slate-600 hover:text-teal-500 dark:text-slate-400"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      href="/register"
                      className="text-slate-600 hover:text-teal-500 dark:text-slate-400"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("nav.register")}
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}