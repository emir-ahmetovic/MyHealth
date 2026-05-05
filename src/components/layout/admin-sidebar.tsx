"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Building, Calendar, LayoutDashboard, LogOut, Settings, Users } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Clinics",
      href: "/admin/clinics",
      icon: Building,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Appointments",
      href: "/admin/appointments",
      icon: Calendar,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="hidden h-screen w-64 flex-col border-r bg-white dark:bg-slate-900 md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white">MZ</div>
          <span>MojeZdravlje</span>
          <span className="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
            Admin
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-1 px-4">
          {routes.map((route, i) => (
            <Link
              key={i}
              href={route.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-slate-100 hover:text-teal-500 dark:hover:bg-slate-800 ${
                pathname === route.href
                  ? "bg-teal-50 font-medium text-teal-500 dark:bg-teal-900/20 dark:text-teal-300"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <route.icon className={`h-4 w-4 ${pathname === route.href ? "text-teal-500 dark:text-teal-300" : ""}`} />
              {route.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-6">
        <Link
          href="/admin/logout"
          className="flex w-full items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-200 hover:text-teal-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-teal-300"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Link>
      </div>
    </div>
  )
}