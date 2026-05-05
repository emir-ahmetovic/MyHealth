"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Add state for form fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({
        title: "Greška",
        description: "Lozinke se ne podudaraju.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: `${firstName} ${lastName}`,
          email,
          phone,
          password,
          role: "PATIENT",
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Greška pri registraciji.")
      }
      toast({
        title: "Registracija uspješna",
        description: "Vaš nalog je uspješno kreiran.",
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

  return (
    <div className="container flex items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Registracija pacijenta</CardTitle>
            <CardDescription>Kreirajte nalog za rezervaciju termina u klinikama</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">Ime</Label>
                  <Input id="first-name" required className="h-12" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Prezime</Label>
                  <Input id="last-name" required className="h-12" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="ime@primjer.com" required className="h-12" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Broj telefona</Label>
                <Input id="phone" type="tel" placeholder="+387 XX XXX XXX" required className="h-12" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Lozinka</Label>
                <Input id="password" type="password" required className="h-12" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Potvrdi lozinku</Label>
                <Input id="confirm-password" type="password" required className="h-12" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm">
                  Slažem se sa
                  <Link href="/terms" className="text-teal-500 hover:underline">
                    uslovima korištenja
                  </Link>
                  i
                  <Link href="/privacy" className="text-teal-500 hover:underline">
                    politikom privatnosti
                  </Link>
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="h-12 w-full bg-teal-500 hover:bg-teal-600" disabled={isLoading}>
                {isLoading ? "Kreiranje naloga..." : "Kreiraj nalog"}
              </Button>
              <div className="text-center text-sm">
                Već imate nalog?{" "}
                <Link href="/login" className="text-teal-500 hover:underline">
                  Prijavi se
                </Link>
              </div>
              <div className="text-center text-sm">
                Jeste li klinika?{" "}
                <Link href="/register/clinic" className="text-teal-500 hover:underline">
                  Registrujte svoju kliniku
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}