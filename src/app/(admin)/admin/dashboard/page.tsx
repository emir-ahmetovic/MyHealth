"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "../../../../components/shared/user-context"

export default function AdminDashboard() {
  const user = useUser().user
  const router = useRouter()

  useEffect(() => {
    if (user && user.role === "CLINIC") {
      router.replace("/clinic-dashboard")
    }
  }, [user, router])

  if (user && user.role === "CLINIC") {
    return null
  }

  return null;
}
