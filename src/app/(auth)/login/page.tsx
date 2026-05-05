"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/components/shared/user-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { toast } = useToast()
  const { setUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [clinicEmail, setClinicEmail] = useState("")
  const [clinicPassword, setClinicPassword] = useState("")

  const handlePatientLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "PATIENT" })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Greška pri prijavi.")
      }
      setUser(data.user)
      toast({
        title: "Prijava uspješna",
        description: "Uspješno ste prijavljeni.",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Došlo je do greške.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClinicLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clinicEmail, password: clinicPassword, role: "CLINIC" })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Greška pri prijavi.")
      }
      setUser(data.user)
      toast({
        title: "Prijava uspješna",
        description: "Uspješno ste prijavljeni kao klinika.",
      })
      router.push("/admin/dashboard")
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Došlo je do greške.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patient">Pacijent</TabsTrigger>
            <TabsTrigger value="clinic">Klinika</TabsTrigger>
          </TabsList>
          <TabsContent value="patient">
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Prijava pacijenta</CardTitle>
                <CardDescription>Unesite podatke za pristup svom nalogu</CardDescription>
              </CardHeader>
              <form onSubmit={handlePatientLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="ime@primjer.com" required className="h-12" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Lozinka</Label>
                      <Link href="/forgot-password" className="text-xs text-teal-500 hover:underline">
                        Zaboravljena lozinka?
                      </Link>
                    </div>
                    <Input id="password" type="password" required className="h-12" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="h-12 w-full bg-teal-500 hover:bg-teal-600" disabled={isLoading}>
                    {isLoading ? "Prijava..." : "Prijavi se"}
                  </Button>
                  <div className="text-center text-sm">
                    Nemate nalog?{" "}
                    <Link href="/register" className="text-teal-500 hover:underline">
                      Registruj se
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="clinic">
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Prijava klinike</CardTitle>
                <CardDescription>Unesite podatke klinike za pristup kontrolnoj tabli</CardDescription>
              </CardHeader>
              <form onSubmit={handleClinicLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-email">Email</Label>
                    <Input id="clinic-email" type="email" placeholder="klinika@primjer.com" required className="h-12" value={clinicEmail} onChange={e => setClinicEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="clinic-password">Lozinka</Label>
                      <Link href="/forgot-password" className="text-xs text-teal-500 hover:underline">
                        Zaboravljena lozinka?
                      </Link>
                    </div>
                    <Input id="clinic-password" type="password" required className="h-12" value={clinicPassword} onChange={e => setClinicPassword(e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="h-12 w-full bg-teal-500 hover:bg-teal-600" disabled={isLoading}>
                    {isLoading ? "Prijava..." : "Prijavi se"}
                  </Button>
                  <div className="text-center text-sm">
                    Don&apos;t have a clinic account?{" "}
                    <Link href="/register/clinic" className="text-teal-500 hover:underline">
                      Register your clinic
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}