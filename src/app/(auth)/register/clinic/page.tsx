"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function ClinicRegistrationPage() {
  // Add state for clinic registration fields
  const [clinicName, setClinicName] = useState("")
  const [clinicEmail, setClinicEmail] = useState("")
  const [clinicPhone, setClinicPhone] = useState("")
  const [clinicPassword, setClinicPassword] = useState("")
  const [clinicConfirmPassword, setClinicConfirmPassword] = useState("")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const router = useRouter()

  const cities = ["Sarajevo", "Banja Luka", "Tuzla", "Zenica", "Mostar", "Bijeljina", "Prijedor", "Brčko"]

  const specializations = [
    "General Medicine",
    "Dentistry",
    "Dermatology",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Gynecology",
    "Pediatrics",
    "Ophthalmology",
    "Psychiatry",
  ]

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (step < 3) {
      setStep(step + 1)
      return
    }

    setIsLoading(true)

    if (step === 3) {
      if (clinicPassword !== clinicConfirmPassword) {
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
            full_name: clinicName,
            email: clinicEmail,
            phone: clinicPhone,
            password: clinicPassword,
            role: "CLINIC",
          }),
        })
        setIsLoading(false)
        toast({
          title: "Registration submitted",
          description: "Your clinic registration has been submitted for approval.",
        })
        router.push("/")
      } catch (error) {
        setIsLoading(false)
        toast({
          title: "Greška",
          description: "Došlo je do greške pri registraciji klinike.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="container flex items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Clinic Registration</CardTitle>
            <CardDescription>Register your clinic to join our healthcare platform</CardDescription>
            <div className="mt-6 flex items-center justify-between">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                      step >= i
                        ? "bg-teal-500 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {i}
                  </div>
                  {i < 3 && (
                    <div className={`h-1 w-16 ${step > i ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"}`}></div>
                  )}
                </div>
              ))}
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-name">Clinic name</Label>
                    <Input id="clinic-name" required className="h-12" value={clinicName} onChange={e => setClinicName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-email">Email</Label>
                    <Input id="clinic-email" type="email" placeholder="clinic@example.com" required className="h-12" value={clinicEmail} onChange={e => setClinicEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-phone">Phone number</Label>
                    <Input id="clinic-phone" type="tel" placeholder="+387 XX XXX XXX" required className="h-12" value={clinicPhone} onChange={e => setClinicPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-website">Website (optional)</Label>
                    <Input id="clinic-website" type="url" placeholder="https://www.example.com" className="h-12" />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-address">Address</Label>
                    <Input id="clinic-address" required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-city">City</Label>
                    <Select required>
                      <SelectTrigger id="clinic-city" className="h-12">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city.toLowerCase()}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-postal">Postal code</Label>
                    <Input id="clinic-postal" required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Specializations</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {specializations.map((spec) => (
                        <div key={spec} className="flex items-center space-x-2">
                          <Checkbox id={`spec-${spec.toLowerCase().replace(/\s/g, "-")}`} />
                          <Label htmlFor={`spec-${spec.toLowerCase().replace(/\s/g, "-")}`} className="text-sm">
                            {spec}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-description">Clinic description</Label>
                    <Textarea
                      id="clinic-description"
                      placeholder="Describe your clinic, services, and facilities"
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-license">License number</Label>
                    <Input id="clinic-license" required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-password">Password</Label>
                    <Input id="clinic-password" type="password" required className="h-12" value={clinicPassword} onChange={e => setClinicPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-confirm-password">Confirm password</Label>
                    <Input id="clinic-confirm-password" type="password" required className="h-12" value={clinicConfirmPassword} onChange={e => setClinicConfirmPassword(e.target.value)} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="clinic-terms" required />
                    <Label htmlFor="clinic-terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-teal-500 hover:underline">
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-teal-500 hover:underline">
                        privacy policy
                      </Link>
                    </Label>
                  </div>
                  <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <p>
                      Note: Your clinic registration will be reviewed by our admin team before approval. This process
                      typically takes 1-2 business days.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex w-full gap-2">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="h-12 w-full">
                    Back
                  </Button>
                )}
                <Button type="submit" className="h-12 w-full bg-teal-500 hover:bg-teal-600" disabled={isLoading}>
                  {step < 3 ? "Continue" : isLoading ? "Submitting..." : "Submit Registration"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have a clinic account?{" "}
                <Link href="/login" className="text-teal-500 hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
// This code implements a multi-step clinic registration form using React and Next.js.
// It allows clinics to register by providing their details, specializations, and agreeing to terms of service.