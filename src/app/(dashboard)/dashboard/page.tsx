"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/components/shared/user-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { UserSidebar } from "@/components/layout/user-sidebar"
import { CalendarIcon, Clock, MapPin } from "lucide-react"

export default function UserDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [actualAppointments, setActualAppointments] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [pastAppointments, setPastAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  // Store notes per appointment id
  const [notes, setNotes] = useState<{ [id: string]: string }>({});
  const { user } = useUser()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch("/api/dashboard-data")
        if (res.ok) {
          const data = await res.json()
          const now = new Date();
          // Show all appointments with status scheduled, accepted, or cancel_request
          const visible = (data.actualAppointments || [])
            .filter((apt: any) => ["scheduled", "accepted", "cancel_request"].includes(apt.status))
            .sort((a: any, b: any) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime());
          const upcoming = visible.filter((apt: any) => new Date(apt.appointment_time) >= now).slice(0, 5);
          const past = visible.filter((apt: any) => new Date(apt.appointment_time) < now);
          // Filter requested/pending appointments
          const requested = (data.actualAppointments || [])
            .filter((apt: any) => apt.status === "requested" || apt.status === "pending")
            .sort((a: any, b: any) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime())
          setActualAppointments(upcoming)
          setPastAppointments(past)
          setPendingRequests(requested)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-teal-500">Potvrđeno</Badge>
      case "pending":
        return <Badge className="bg-amber-500">Za odobrenje</Badge>
      case "scheduled":
        return <Badge className="bg-teal-400">Zakazano</Badge>
      case "requested":
        return <Badge className="bg-amber-500">Zahtjev poslan</Badge>
      case "accepted":
        return <Badge className="bg-teal-500">Prihvaćeno</Badge>
      case "completed":
        return <Badge variant="outline">Završeno</Badge>
      case "cancelled":
        return <Badge variant="destructive">Otkazano</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("bs-BA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <UserSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Kontrolna tabla</h1>
          <p className="text-slate-500 dark:text-slate-400">Dobrodošli nazad{user?.full_name ? `, ${user.full_name}` : ""}!</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-0 shadow-md md:col-span-2">
            <CardHeader>
              <CardTitle>Nadolazeći termini</CardTitle>
              <CardDescription>Vaših 5 najbližih zakazanih termina</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                  <p className="text-slate-500 dark:text-slate-400">Učitavanje...</p>
                </div>
              ) : actualAppointments.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                  <p className="text-slate-500 dark:text-slate-400">Nema nadolazećih termina</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {actualAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col justify-between rounded-lg border-0 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 sm:flex-row sm:items-center"
                    >
                      <div>
                        <div className="font-medium">{appointment.clinics?.name}</div>
                        <div className="text-sm">
                          {appointment.doctor?.full_name || appointment.doctors?.full_name} {appointment.doctor?.specialization || appointment.doctors?.specialization ? ` • ${appointment.doctor?.specialization ?? appointment.doctors?.specialization}` : ""}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {formatDate(appointment.appointment_time)}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {appointment.clinics?.address}
                        </div>
                        {appointment.status === 'cancel_request' && (
                          <div className="mt-2">
                            <Badge className="bg-amber-500 text-white">Zahtjev za otkazivanje u toku</Badge>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-2 sm:mt-0">
                        {getStatusBadge(appointment.status)}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={appointment.status === 'cancel_request'}
                            >
                              Zatraži otkazivanje
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Potvrda otkazivanja</AlertDialogTitle>
                              <AlertDialogDescription>
                                Da li ste sigurni da želite zatražiti otkazivanje ovog termina?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="mt-4">
                              <label htmlFor={`cancel-note-${appointment.id}`} className="block text-sm font-medium mb-1">Poruka za kliniku (opcionalno):</label>
                              <textarea
                                id={`cancel-note-${appointment.id}`}
                                className="w-full rounded border p-2 text-sm"
                                rows={3}
                                placeholder="Unesite poruku ili razlog otkazivanja (opcionalno)"
                                value={notes[appointment.id] || ""}
                                onChange={e => setNotes(prev => ({ ...prev, [appointment.id]: e.target.value }))}
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Odustani</AlertDialogCancel>
                              <AlertDialogAction
                                asChild
                              >
                                <Button
                                  variant="destructive"
                                  onClick={async () => {
                                    const res = await fetch('/api/appointments', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: appointment.id, status: 'cancel_request', cancel_reason: notes[appointment.id] || "" })
                                    });
                                    if (res.ok) {
                                      window.location.reload();
                                    } else {
                                      alert('Greška pri slanju zahtjeva.');
                                    }
                                  }}
                                >
                                  Potvrdi otkazivanje
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Pending requests below actual appointments */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Zahtjevi na čekanju</h2>
                {pendingRequests.length === 0 ? (
                  <div className="flex h-20 items-center justify-center rounded-md border border-dashed">
                    <p className="text-slate-500 dark:text-slate-400">Nema zahtjeva na čekanju</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col justify-between rounded-lg border-0 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 sm:flex-row sm:items-center"
                      >
                        <div>
                          <div className="font-medium">{appointment.clinics?.name}</div>
                          <div className="text-sm">
                            {appointment.doctor?.full_name || appointment.doctors?.full_name} {appointment.doctor?.specialization || appointment.doctors?.specialization ? ` • ${appointment.doctor?.specialization ?? appointment.doctors?.specialization}` : ""}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {formatDate(appointment.appointment_time)}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3.5 w-3.5" />
                            {appointment.clinics?.address}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 sm:mt-0">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Link href="/appointments">
                  <Button variant="link" className="p-0 text-teal-500">
                    Pogledaj sve termine →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Kalendar</CardTitle>
              <CardDescription>Pogledajte i upravljajte svojim rasporedom</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              <div className="mt-4 space-y-2">
                {actualAppointments
                  .filter(
                    (appointment: any) =>
                      new Date(appointment.appointment_time).toDateString() === (date?.toDateString() || new Date().toDateString()),
                  )
                  .map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-2 rounded-md bg-slate-100 p-2 text-sm dark:bg-slate-800"
                    >
                      <Clock className="h-4 w-4 text-teal-500" />
                      <div>
                        <div className="font-medium">
                          {new Date(appointment.appointment_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{appointment.clinics?.name}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="history">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="history" className="flex-1">
                Historija termina
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex-1">
                Medicinski karton
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex-1">
                Recepti
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Prošli termini</CardTitle>
                  <CardDescription>Vaša historija termina</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                      <p className="text-slate-500 dark:text-slate-400">Učitavanje...</p>
                    </div>
                  ) : pastAppointments.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                      <p className="text-slate-500 dark:text-slate-400">Nema prošlih termina</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex flex-col justify-between rounded-lg border-0 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 sm:flex-row sm:items-center"
                        >
                          <div>
                            <div className="font-medium">{appointment.clinics?.name}</div>
                            <div className="text-sm">
                              {appointment.doctor?.full_name || appointment.doctors?.full_name} {appointment.doctor?.specialization || appointment.doctors?.specialization ? ` • ${appointment.doctor?.specialization ?? appointment.doctors?.specialization}` : ""}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              {formatDate(appointment.appointment_time)}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                              <MapPin className="h-3.5 w-3.5" />
                              {appointment.clinics?.address}
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-2 sm:mt-0">
                            {getStatusBadge(appointment.status)}
                            <Button variant="outline" size="sm">
                              Detalji termina
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-teal-50 text-teal-500 hover:bg-teal-100 hover:text-teal-600 dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/30"
                            >
                              Rezerviši ponovo
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="medical" className="mt-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Medicinski karton</CardTitle>
                  <CardDescription>Vaša medicinska historija i kartoni</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                    <p className="text-slate-500 dark:text-slate-400">Medicinski kartoni će se prikazati ovdje</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="prescriptions" className="mt-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Recepti</CardTitle>
                  <CardDescription>Vaša historija recepata</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                    <p className="text-slate-500 dark:text-slate-400">Recepti će se prikazati ovdje</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}