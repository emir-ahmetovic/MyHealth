"use client";
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ClinicSidebar } from "@/components/layout/clinic-sidebar";
import { CalendarIcon, Clock, User, Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ClinicDashboard() {
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [allAppointments, setAllAppointments] = useState<any[]>([])
  const [stats, setStats] = useState([
    { title: "Današnji termini", value: "-" },
    { title: "Na čekanju", value: "-" },
    { title: "Ukupno pacijenata", value: "-" },
  ])
  const [loading, setLoading] = useState(true)

  // Fetch appointments for selected date when date changes
  async function fetchForDate() {
    if (!date) {
      setSelectedDateAppointments([]);
      return;
    }
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
    let url = `/api/appointments?start=${start.toISOString()}&end=${end.toISOString()}`;
    const res = await fetch(url);
    const data = await res.json();
    setSelectedDateAppointments(
      (data || [])
        .filter((a: any) => a.status !== "pending" && a.status !== "declined" && a.status !== "cancelled")
        .map((a: any) => {
          let patientName = a.users?.full_name || "Unknown";
          let note = a.notes || "";
          if (note.includes('Ime pacijenta:')) {
            const match = note.match(/Ime pacijenta:\s*([^\n]+)/);
            if (match) patientName = match[1].trim();
          }
          return {
            id: a.id,
            patientName,
            time: a.appointment_time,
            note,
          };
        })
    );
  }
  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/dashboard-data")
      const data = await res.json()
      // Map API data to UI format
        // Filter out past appointments, then sort by time ascending, take next 5
        const now = new Date();
        const sorted = (data.appointments || [])
          .filter((a: any) => new Date(a.appointment_time) > now)
          .sort((a: any, b: any) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime());
      // If doctor info is missing, fetch doctors and match by doctor_id
      let doctorsMap: Record<string, string> = {};
      if (data.doctors && Array.isArray(data.doctors)) {
        data.doctors.forEach((doc: any) => {
          doctorsMap[doc.id] = doc.full_name;
        });
      }
      // Debug: log doctorsMap and appointments
      console.log('doctorsMap:', doctorsMap);
  setAllAppointments((data.appointments || []).filter((a: any) => a.status !== "declined" && a.status !== "cancelled"));
      setUpcomingAppointments(
        sorted.slice(0, 5).map((a: any, idx: number) => {
          let patientName = a.users?.full_name || "Unknown";
          let note = a.notes || "";
          if (note.includes('Ime pacijenta:')) {
            const match = note.match(/Ime pacijenta:\s*([^\n]+)/);
            if (match) patientName = match[1].trim();
          }
          let doctorName = "";
          if (a.doctor?.full_name) doctorName = a.doctor.full_name;
          else if (a.doctor_name) doctorName = a.doctor_name;
          else if (a.doctor && typeof a.doctor === "string") doctorName = a.doctor;
          else if (a.doctor_id && doctorsMap[a.doctor_id]) doctorName = doctorsMap[a.doctor_id];
          if (idx < 3) console.log('Appointment doctor_id:', a.doctor_id, 'doctorName:', doctorName);
          return {
            id: a.id,
            patientName,
            patientEmail: a.users?.email || "",
            patientPhone: a.users?.phone || "",
            service: a.appointment_types?.name || "",
            date: a.appointment_time,
            status: a.status || "scheduled",
            doctorName,
          };
        })
      );
      // Calculate today's appointments
      const today = new Date();
      const todaysAppointments = (data.appointments || []).filter((a: any) => {
        const apptDate = new Date(a.appointment_time);
        return apptDate.getFullYear() === today.getFullYear() &&
          apptDate.getMonth() === today.getMonth() &&
          apptDate.getDate() === today.getDate();
      }).length;
      setStats([
        { title: "Današnji termini", value: String(todaysAppointments) },
        { title: "Na čekanju", value: String(data.stats?.pendingApprovals ?? "-") },
        { title: "Ukupno pacijenata", value: String(data.stats?.totalPatients ?? "-") },
      ])
    } catch (error) {
      setUpcomingAppointments([])
      setStats([
        { title: "Današnji termini", value: "-" },
        { title: "Na čekanju", value: "-" },
        { title: "Ukupno pacijenata", value: "-" },
      ])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchForDate();
  }, [date]);
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-teal-500">Potvrđeno</Badge>
      case "pending":
        return <Badge className="bg-amber-500">Na čekanju</Badge>
      case "completed":
        return <Badge variant="outline">Završeno</Badge>
      case "cancelled":
        return <Badge variant="destructive">Otkazano</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ClinicSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Klinika - kontrolna ploča</h1>
          <p className="text-slate-500 dark:text-slate-400">Dobro došli</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat: { title: string; value: string }, i: number) => (
            <Card key={i} className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <Card className="border-0 shadow-md md:col-span-2">
            <CardHeader>
              <CardTitle>Nadolazeći termini</CardTitle>
              <CardDescription>Upravljajte zakazanim terminima</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Show the closest five appointments (today and future, excluding pending), sorted by time, always with patient info
                const now = new Date();
                const allAppointmentsList = [...allAppointments];
                const filtered = allAppointmentsList
                  .filter(a => {
                    if (["pending", "cancelled", "declined"].includes(a.status)) return false;
                    const apptDate = new Date(a.appointment_time);
                    return apptDate > now;
                  })
                  .sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime())
                  .slice(0, 5)
                  .map((a: any) => {
                    // Always show patient info from users if available
                    let note = a.notes || "";
                    let patientName =
                      a.patientName
                      || a.users?.full_name
                      || (note.includes('Ime pacijenta:') ? (note.match(/Ime pacijenta:\s*([^\n]+)/)?.[1]?.trim() || "") : "")
                      || a.patient_id
                      || "Unknown";
                    let patientEmail = a.patientEmail || (a.users?.email ?? "");
                    let patientPhone = a.patientPhone || (a.users?.phone ?? "");
                    return { ...a, patientName, patientEmail, patientPhone };
                  });
                return filtered.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                    <p className="text-slate-500 dark:text-slate-400">Nema nadolazećih termina</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filtered.map((appointment: any) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col justify-between rounded-lg border-0 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 sm:flex-row sm:items-center"
                      >
                        <div>
                          <div className="font-medium">Pacijent: {appointment.patientName}</div>
                          <div className="text-sm">{appointment.service}</div>
                          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>Datum: {new Date(appointment.appointment_time).toLocaleDateString('en-GB')}</span>
                            <span className="ml-2">Vrijeme: {new Date(appointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                            <User className="h-3.5 w-3.5" />
                            <span>Email: {appointment.patientEmail}</span>
                            {appointment.doctorName && appointment.doctorName.trim() !== "" ? (
                              <span className="ml-2">Doktor: {appointment.doctorName}</span>
                            ) : (
                              <span className="ml-2">•</span>
                            )}
                            {appointment.patientPhone && (
                              <span className="ml-2">Telefon: {appointment.patientPhone}</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 sm:mt-0">
                          {getStatusBadge(appointment.status)}
                          {appointment.status === "confirmed" && (
                            <>
                              <Button variant="outline" size="sm">
                                Promijeni termin
                              </Button>
                              <Button variant="outline" size="sm">
                                Detalji
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Kalendar</CardTitle>
              <CardDescription>Pogledajte i upravljajte rasporedom</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border mb-4" />
              <div style={{ maxHeight: 240, overflowY: 'auto' }} className="border rounded p-2 bg-slate-50">
                <div className="font-semibold mb-2">Termini za {date?.toLocaleDateString("bs")}</div>
                {selectedDateAppointments.filter(a => a.status !== "declined" && a.status !== "cancelled").length === 0 ? (
                  <div className="text-slate-500">Nema termina za ovaj dan.</div>
                ) : (
                  [...selectedDateAppointments]
                    .filter(a => a.status !== "declined" && a.status !== "cancelled")
                    .sort((a, b) => {
                      if (!a.time) return 1;
                      if (!b.time) return -1;
                      return new Date(a.time).getTime() - new Date(b.time).getTime();
                    })
                    .map(a => (
                      <div key={a.id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                        <div>
                          <span className="font-medium">{a.patientName}</span>
                          <span className="ml-2 text-xs text-slate-500">{a.time ? new Date(a.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) : ""}</span>
                          {a.doctorName && (
                            <div className="text-xs text-slate-500 mt-1">Doktor: {a.doctorName}</div>
                          )}
                        </div>
                        {a.note && <span className="text-xs text-slate-400 ml-2">{a.note}</span>}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="availability">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="availability" className="flex-1">
                Zahtjevi
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex-1">
                Pacijenti
              </TabsTrigger>
              <TabsTrigger value="services" className="flex-1">
                Usluge
              </TabsTrigger>
            </TabsList>
            <TabsContent value="availability" className="mt-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Zahtjevi za termine</CardTitle>
                  <CardDescription>Pregled i upravljanje zahtjevima od korisnika</CardDescription>
                </CardHeader>
                <CardContent>
                  {allAppointments.filter(a => ["pending","cancel_request","move_request"].includes(a.status) && a.status !== "cancelled").length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                      <p className="text-slate-500 dark:text-slate-400">Nema zahtjeva za termine</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allAppointments.filter(a => ["pending","cancel_request","move_request"].includes(a.status) && a.status !== "cancelled").map((appointment: any) => (
                        <div
                          key={appointment.id}
                          className="flex flex-col justify-between rounded-lg border-0 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 sm:flex-row sm:items-center"
                        >
                          <div>
                            <div className="font-medium">Pacijent: {appointment.patientName || appointment.users?.full_name || "Unknown"}</div>
                            <div className="text-sm">{appointment.service}</div>
                            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              {appointment.date ? formatDate(appointment.date) : formatDate(appointment.appointment_time)}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                              <User className="h-3.5 w-3.5" />
                              <span>Email: {appointment.patientEmail || appointment.users?.email || ""}</span>
                              {appointment.doctorName && appointment.doctorName.trim() !== "" ? (
                                <span className="ml-2">Doktor: {appointment.doctorName}</span>
                              ) : (
                                <span className="ml-2">•</span>
                              )}
                              {(appointment.patientPhone || appointment.users?.phone) && (
                                <span className="ml-2">Telefon: {appointment.patientPhone || appointment.users?.phone}</span>
                              )}
                            </div>
                            {appointment.status === 'cancel_request' && (
                              <div className="mt-2 text-sm text-red-600 font-semibold">Zahtjev za otkazivanje{appointment.cancelled_reason ? `: ${appointment.cancelled_reason}` : ''}</div>
                            )}
                            {appointment.status === 'move_request' && (
                              <div className="mt-2 text-sm text-yellow-600 font-semibold">Zahtjev za pomjeranje termina{appointment.suggested_time ? ` na ${formatDate(appointment.suggested_time)}` : ''}</div>
                            )}
                          </div>
                          <div className="mt-4 flex items-center gap-2 sm:mt-0">
                            {getStatusBadge(appointment.status)}
                            {appointment.status === 'cancel_request' ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-9 gap-1"
                                onClick={async () => {
                                  // Delete the appointment
                                  const res = await fetch(`/api/appointments?id=${appointment.id}`, {
                                    method: "DELETE"
                                  });
                                  if (res.ok) {
                                    toast({
                                      title: "Termin otkazan",
                                      description: "Termin je uspješno otkazan.",
                                      duration: 3000,
                                    });
                                  } else {
                                    toast({
                                      title: "Greška",
                                      description: "Greška pri otkazivanju termina.",
                                      variant: "destructive",
                                      duration: 3000,
                                    });
                                  }
                                  await fetchDashboardData();
                                  await fetchForDate();
                                }}
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Odobri otkazivanje</span>
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                className="h-9 gap-1 bg-teal-500 hover:bg-teal-600"
                                onClick={async () => {
                                  const res = await fetch(`/api/appointments`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: appointment.id, status: "scheduled" })
                                  });
                                  if (res.ok) {
                                    toast({
                                      title: "Zahtjev odbijen",
                                      description: "Zahtjev za otkazivanje je odbijen.",
                                      duration: 3000,
                                    });
                                  } else {
                                    toast({
                                      title: "Greška",
                                      description: "Greška pri odbijanju zahtjeva.",
                                      variant: "destructive",
                                      duration: 3000,
                                    });
                                  }
                                  await fetchDashboardData();
                                  await fetchForDate();
                                }}
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Odobri</span>
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-9 gap-1"
                              onClick={async () => {
                                // Decline: set status back to 'scheduled' (do not delete)
                                const res = await fetch(`/api/appointments`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: appointment.id, status: "scheduled" })
                                });
                                if (res.ok) {
                                  toast({
                                    title: "Zahtjev odbijen",
                                    description: "Zahtjev za otkazivanje je odbijen.",
                                    duration: 3000,
                                  });
                                } else {
                                  toast({
                                    title: "Greška",
                                    description: "Greška pri odbijanju zahtjeva.",
                                    variant: "destructive",
                                    duration: 3000,
                                  });
                                }
                                await fetchDashboardData();
                                await fetchForDate();
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Odbij</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="patients" className="mt-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Podaci o pacijentima</CardTitle>
                  <CardDescription>Upravljajte podacima o pacijentima</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                    <p className="text-slate-500 dark:text-slate-400">Podaci o pacijentima bi se prikazali ovdje</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="services" className="mt-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Usluge i cijene</CardTitle>
                  <CardDescription>Upravljajte uslugama i cijenama</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                    <p className="text-slate-500 dark:text-slate-400">Usluge i cijene bi se prikazale ovdje</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
// This code is a client-side component for a clinic dashboard in a healthcare application.
// It includes features like viewing upcoming appointments, managing availability, and accessing patient records.