"use client"

import { useState, use } from "react"
import { useUser } from "@/components/shared/user-context"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { normalizeAppointment } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  CalendarIcon,
  GraduationCap,
  DollarSign,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

export default function ClinicPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useUser();
  // Unwrap the params Promise
  const { id } = use(params)
  const [date, setDate] = useState<Date>(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  // Appointments for booking step (doctor/date)
  const [appointments, setAppointments] = useState<any[]>([]);

  // Helpers: parse working days and working hours into canonical forms
  const weekdayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  function parseWorkingDaysToNumbers(raw: any): number[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw
        .map((d) => (typeof d === 'number' ? d : String(d).trim().slice(0, 3).toLowerCase()))
        .map((s) => (typeof s === 'number' ? s : (weekdayMap as any)[s] ?? -1))
        .filter((n) => n >= 0);
    }
    if (typeof raw === 'string') {
      return String(raw)
        .split(/[,|;]+/)
        .map((s) => s.trim().slice(0, 3).toLowerCase())
        .map((s) => (weekdayMap as any)[s] ?? -1)
        .filter((n) => n >= 0);
    }
    return [];
  }

  function parseWorkingHoursToMinutes(raw: any): { startMin: number; endMin: number } | null {
    if (!raw) return null;
    if (typeof raw === 'string') {
      const parts = raw.split(/[-–—]/).map((s) => s.trim());
      if (parts.length === 2) {
        const [sh, eh] = parts;
        const [shH, shM] = sh.split(':').map(Number);
        const [ehH, ehM] = eh.split(':').map(Number);
        if (!Number.isNaN(shH) && !Number.isNaN(ehH)) {
          return { startMin: shH * 60 + (shM || 0), endMin: ehH * 60 + (ehM || 0) };
        }
      }
    }
    if (typeof raw === 'object') {
      if (raw.start && raw.end) {
        const [shH, shM] = String(raw.start).split(':').map(Number);
        const [ehH, ehM] = String(raw.end).split(':').map(Number);
        if (!Number.isNaN(shH) && !Number.isNaN(ehH)) {
          return { startMin: shH * 60 + (shM || 0), endMin: ehH * 60 + (ehM || 0) };
        }
      }
      if (raw.startHour !== undefined && raw.endHour !== undefined) {
        return { startMin: Number(raw.startHour) * 60, endMin: Number(raw.endHour) * 60 };
      }
    }
    return null;
  }
  
  // Debug date changes
  useEffect(() => {
    if (date) {
      console.log('Selected date changed:', date);
    }
  }, [date]);
  useEffect(() => {
    async function fetchAppointments() {
      if (!id || !date || !selectedDoctor) return;
      try {
        const dateStr = date.toISOString().slice(0, 10);
        const res = await fetch(`/api/appointments?date=${dateStr}&clinic_id=${id}&doctor_id=${selectedDoctor.id}`);
  const data = await res.json();
  // Normalize appointment objects so frontend can rely on `doctor` field
  const normalized = (data || []).map((a: any) => normalizeAppointment(a));
  setAppointments(normalized);
      } catch (error) {
        setAppointments([]);
      }
    }
    fetchAppointments();
  }, [id, date, selectedDoctor]);
  const { toast } = useToast()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingStep, setBookingStep] = useState<"doctor" | "datetime" | "confirm">("doctor")

  // Real clinic data state and fetch logic
  const [clinic, setClinic] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClinic() {
      try {
        const res = await fetch(`/api/clinics/${id}`)
        if (!res.ok) throw new Error("Neuspješno učitavanje klinike")
        const data = await res.json()
        // Normalize clinic fields (API might return snake_case or different keys)
        const rawClinic = data.clinic || {}
        const normalizedClinic: any = {
          ...rawClinic,
          // Prefer camelCase, fallback to snake_case
          workingHours: rawClinic.workingHours ?? rawClinic.working_hours ?? rawClinic.working_time ?? "",
          specializations: rawClinic.specializations ?? rawClinic.specialties ?? rawClinic.specialization ?? [],
        }
        // Attach normalized clinic first so UI can render basic info while doctors load
        setClinic(normalizedClinic)

        // Fetch doctors for this clinic and normalize their working days
        const docRes = await fetch(`/api/doctors/by-clinic?id=${id}`)
        if (docRes.ok) {
          const docData = await docRes.json()
          const doctors = (docData.doctors || []).map((d: any) => {
            const workingDaysRaw = d.workingDays ?? d.working_days ?? d.working_days_raw ?? d.working_days_string
            let workingDays: string[] = []
            if (Array.isArray(workingDaysRaw)) workingDays = workingDaysRaw
            else if (typeof workingDaysRaw === 'string') {
              // split comma or pipe separated strings
              workingDays = workingDaysRaw.split(/[,|;]/).map((s: string) => s.trim()).filter(Boolean)
            }
            return { ...d, workingDays }
          })
          setClinic((prev: any) => ({ ...prev, doctors }))
        }
      } catch (error) {
        setClinic(null)
      } finally {
        setLoading(false)
      }
    }
    fetchClinic()
  }, [id])

  if (loading) {
    return (
      <div className="container px-4 py-12 md:px-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Učitavanje klinike...</p>
        </div>
      </div>
    )
  }
  if (!clinic) {
    return (
      <div className="container px-4 py-12 md:px-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-500">Klinika nije pronađena.</p>
        </div>
      </div>
    )
  }

  // Generate available time slots based on selected doctor and date
  const getAvailableTimeSlots = (doctorId: number, selectedDate: Date) => {
    const slots: string[] = [];
    const now = new Date();
    const isToday = selectedDate.getDate() === now.getDate() &&
                    selectedDate.getMonth() === now.getMonth() &&
                    selectedDate.getFullYear() === now.getFullYear();
    
    // Default working hours (can be customized based on doctor's schedule)
    const startHour = 8;
    const endHour = 16;
    
    // For today, only show future time slots
    const currentHour = isToday ? now.getHours() : startHour - 1;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      // For today, skip past times
      if (isToday && hour <= currentHour) continue;
      
      // Add available slots
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < endHour) {
        // Skip :30 slot if it's in the past for today
        if (!(isToday && hour === currentHour && now.getMinutes() >= 30)) {
          slots.push(`${hour.toString().padStart(2, "0")}:30`);
        }
      }
    }
    return slots;
  }

  const handleDoctorSelect = (doctor: any) => {
    console.log('Selected doctor working days:', doctor.workingDays);
    setSelectedDoctor(doctor)
    setBookingStep("datetime")
    setSelectedTime(null)
    setDate(new Date())
  }

  const handleBookAppointment = () => {
    if (!selectedTime || !selectedDoctor || !date) {
      toast({
        title: "Please complete all steps",
        description: "You need to select a doctor, date, and time slot to book an appointment.",
        variant: "destructive",
      });
      return;
    }

    // Store appointment in the database
    (async () => {
      try {
        // If user is a patient, send as request (pending). If clinic, book immediately (scheduled).
        let status: string = "pending";
        let patientId: number | undefined = undefined;
        if (user?.role === "CLINIC") {
          status = "scheduled";
        } else {
          // Default to pending for patients and unknown roles
          status = "pending";
          patientId = user?.id;
        }
        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctor_id: Number(selectedDoctor.id),
            clinic_id: Number(id),
            appointment_time: new Date(date.setHours(Number(selectedTime.split(":")[0]), Number(selectedTime.split(":")[1]), 0, 0)).toISOString(),
            patient_id: patientId,
            status,
          }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error("Failed to book appointment");
        // Refetch appointments to block out the slot
        const dateStr = date.toISOString().slice(0, 10);
        const appointmentsRes = await fetch(`/api/appointments?date=${dateStr}&clinic_id=${id}&doctor_id=${selectedDoctor.id}`);
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData || []);
        toast({
          title: status === "pending" ? "Appointment request sent" : "Appointment booked",
          description: status === "pending"
            ? `Your request with ${selectedDoctor.full_name} on ${date.toLocaleDateString()} at ${selectedTime} has been sent to the clinic.`
            : `Your appointment with ${selectedDoctor.full_name} on ${date.toLocaleDateString()} at ${selectedTime} has been booked.`,
        });
        setSelectedTime(null);
        setBookingStep("doctor");
        setSelectedDoctor(null);
        setDate(new Date());
      } catch (error) {
        toast({
          title: "Booking failed",
          description: "There was an error booking your appointment. Please try again.",
          variant: "destructive",
        });
      }
    })();
  }

  const resetBooking = () => {
    setBookingStep("doctor")
    setSelectedDoctor(null)
    setSelectedTime(null)
    setDate(new Date())
  }

  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="mb-6">
        <Link href="/clinics" className="text-sm text-teal-500 hover:underline">
          ← Nazad na klinike
        </Link>
      </div>

      {/* Clinic Images removed from above the header */}

      {/* Clinic Header */}
      <div className="mb-12 overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-slate-900">
  <div className="relative h-80 w-full overflow-hidden md:h-96">
          {/* Optionally keep the first image as background */}
          <img src={clinic.clinic_gallery?.[0]?.image_url || "/placeholder.svg"} alt={clinic.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="ml-1 font-medium">{clinic.rating}</span>
                <span className="ml-1 text-sm">({clinic.reviews} reviews)</span>
              </div>
            </div>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{clinic.name}</h1>
            <div className="mt-2 flex items-center gap-1 text-sm text-white/80">
              <MapPin className="h-4 w-4" />
              {clinic.address}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {(clinic.specializations ?? []).map((spec: string) => (
              <Badge
                key={spec}
                variant="secondary"
                className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
              >
                {spec}
              </Badge>
            ))}
          </div>
          <p className="text-slate-600 dark:text-slate-300">{clinic.description}</p>
        </div>
      </div>

      {/* Clinic Details and Booking */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="info" className="flex-1">
                Informacije
              </TabsTrigger>
              <TabsTrigger value="doctors" className="flex-1">
                Doktori
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex-1">
                Galerija
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">
                Recenzije
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info">
              <Card className="border-0 bg-white shadow-md dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Adresa</div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <MapPin className="h-4 w-4 text-teal-500" />
                        {clinic.address}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Telefon</div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Phone className="h-4 w-4 text-teal-500" />
                        {clinic.phone}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Mail className="h-4 w-4 text-teal-500" />
                        {clinic.email}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Website</div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Globe className="h-4 w-4 text-teal-500" />
                        <a
                          href={clinic.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-500 hover:underline"
                        >
                          {clinic.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Radno vrijeme</div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Clock className="h-4 w-4 text-teal-500" />
                          {clinic.workingHours || "Nije uneseno"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="doctors">
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                {(clinic.doctors ?? []).length === 0 ? (
                  <div className="text-slate-500">Nema doktora za ovu kliniku.</div>
                ) : (
                  clinic.doctors.map((doctor: any) => (
                    <Card
                      key={doctor.id}
                      className="border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-slate-900"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 overflow-hidden rounded-full flex-shrink-0">
                            <img
                              src={doctor.image || "/placeholder.svg"}
                              alt={doctor.full_name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-lg">{doctor.full_name}</div>
                            <div className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                              {doctor.specialization}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Licenca: {doctor.license_number}</div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2">{doctor.bio}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="gallery">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {(clinic.clinic_gallery ?? []).length > 0 ? (
                  clinic.clinic_gallery.map((img: any, index: number) => (
                    <div key={img.id || index} className="overflow-hidden rounded-lg shadow-md">
                      <img
                        src={img.image_url || "/placeholder.svg"}
                        alt={img.image_title || `${clinic.name} - ${index + 1}`}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ))
                ) : (
                  <div className="overflow-hidden rounded-lg shadow-md">
                    <img
                      src="/placeholder.svg"
                      alt={clinic.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="reviews">
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-slate-500 dark:text-slate-400">Recenzije</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced Booking Section */}
        <div>
          <Card className="sticky top-24 border-0 bg-white shadow-lg dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="mb-6 text-xl font-medium">Rezervišite termin</div>

              {/* Booking Steps Indicator */}
              <div className="mb-6 flex items-center justify-between">
                <div
                  className={`flex items-center ${bookingStep === "doctor" ? "text-teal-500" : bookingStep === "datetime" || bookingStep === "confirm" ? "text-teal-500" : "text-slate-400"}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${bookingStep === "doctor" ? "bg-teal-500 text-white" : bookingStep === "datetime" || bookingStep === "confirm" ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-500"}`}
                  >
                    1
                  </div>
                  <span className="ml-2 text-sm">Doktor</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <div
                  className={`flex items-center ${bookingStep === "datetime" ? "text-teal-500" : bookingStep === "confirm" ? "text-teal-500" : "text-slate-400"}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${bookingStep === "datetime" ? "bg-teal-500 text-white" : bookingStep === "confirm" ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-500"}`}
                  >
                    2
                  </div>
                  <span className="ml-2 text-sm">Datum i vrijeme</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <div className={`flex items-center ${bookingStep === "confirm" ? "text-teal-500" : "text-slate-400"}`}>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${bookingStep === "confirm" ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-500"}`}
                  >
                    3
                  </div>
                  <span className="ml-2 text-sm">Potvrda</span>
                </div>
              </div>

              {/* Step 1: Doctor Selection */}
              {bookingStep === "doctor" && (
                <div>
                  <div className="mb-4 text-sm font-medium">Izaberite doktora</div>
                  <div className="space-y-3">
                     {(clinic.doctors ?? []).map((doctor: any) => (
                      <div
                        key={doctor.id}
                        className="cursor-pointer rounded-lg border p-3 transition-all hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                        onClick={() => handleDoctorSelect(doctor)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-full">
                            <img
                              src={doctor.image || "/placeholder.svg"}
                              alt={doctor.full_name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{doctor.full_name}</div>
                            <div className="text-xs text-teal-600 dark:text-teal-400">{doctor.specialization}</div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs">{doctor.rating}</span>
                              </div>
                              <span className="text-xs font-medium">{doctor.fee}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time Selection */}
              {bookingStep === "datetime" && selectedDoctor && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Izabrani doktor</div>
                      <div className="text-xs text-slate-500">
                        {selectedDoctor.full_name} - {selectedDoctor.specialization}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setBookingStep("doctor")}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 text-sm font-medium">Izaberite datum</div>
                    <div className="border rounded-lg p-4">
                      <Calendar
                        mode="single"
                        selected={date}
                        className="w-full"
                        onSelect={(newDate: Date | undefined) => {
                          console.log('Calendar onSelect called with:', newDate);
                          if (newDate) {
                            // Ensure we're working with a fresh Date object
                            const selectedDate = new Date(newDate);
                            // Reset time selection when date changes
                            setSelectedTime(null);
                            setDate(selectedDate);
                          }
                        }}
                        disabled={(date: Date) => {
                          // Disable past dates (before today)
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const dateToCheck = new Date(date);
                          dateToCheck.setHours(0, 0, 0, 0);
                          
                          if (dateToCheck < today) {
                            return true;
                          }

                          // If no doctor is selected, all future dates are valid
                          if (!selectedDoctor) {
                            return false;
                          }

                          // If doctor has no working days specified, assume all days are working days
                          if (!selectedDoctor.workingDays || !Array.isArray(selectedDoctor.workingDays)) {
                            return false;
                          }

                          // Get the day name
                          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                          const dayName = dayNames[dateToCheck.getDay()];

                          // Convert working days to lowercase for comparison
                          const doctorDays = selectedDoctor.workingDays.map((day: string) => day.toLowerCase());
                          
                          // If the doctor's working days list is empty, allow all days
                          if (doctorDays.length === 0) {
                            return false;
                          }

                          // Check if the doctor works on this day
                          return !doctorDays.includes(dayName.toLowerCase());
                        }}
                      />
                    </div>
                  </div>

                  {date && (
                      <div className="mb-4 mt-4">
                        <div className="mb-2 text-sm font-medium">
                          Slobodni termini za {date.toLocaleDateString('bs')}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {(() => {
                            // Find booked slots for this doctor and date
                            const bookedAppointments = appointments.filter((a: any) => {
                              const apptDate = new Date(a.appointment_time);
                              // Only block out slots for accepted/scheduled appointments
                              return a.doctor_id === selectedDoctor.id &&
                                apptDate.getFullYear() === date.getFullYear() &&
                                apptDate.getMonth() === date.getMonth() &&
                                apptDate.getDate() === date.getDate() &&
                                (a.status === "scheduled" || a.status === "accepted");
                            });
                            const bookedTimes = bookedAppointments.map((a: any) => {
                              const apptDate = new Date(a.appointment_time);
                              return apptDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
                            });
                            return getAvailableTimeSlots(selectedDoctor.id, date).map((time) => {
                              const isBooked = bookedTimes.includes(time);
                              return (
                                <div key={time} className="flex flex-col items-start">
                                  <Button
                                    variant={selectedTime === time ? "default" : "outline"}
                                    className={`text-sm w-full ${isBooked ? "bg-slate-200 text-slate-400 cursor-not-allowed" : selectedTime === time ? "bg-teal-500 hover:bg-teal-600" : ""}`}
                                    onClick={() => !isBooked && setSelectedTime(time)}
                                    disabled={isBooked}
                                  >
                                    {time} {isBooked ? "(Booked)" : ""}
                                  </Button>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                  )}

                  {selectedTime && (
                    <Button className="w-full bg-teal-500 hover:bg-teal-600" onClick={() => setBookingStep("confirm")}>
                      Nastavi do potvrde
                    </Button>
                  )}
                </div>
              )}

              {/* Step 3: Confirmation */}
              {bookingStep === "confirm" && selectedDoctor && selectedTime && date && (
                <div>
                  <div className="mb-4 text-sm font-medium">Potvrdite Vaš termin</div>

                  <div className="space-y-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full">
                        <img
                          src={selectedDoctor.image || "/placeholder.svg"}
                          alt={selectedDoctor.full_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{selectedDoctor.full_name}</div>
                        <div className="text-sm text-teal-600 dark:text-teal-400">{selectedDoctor.specialization}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Datum:</span>
                        <span className="font-medium">{date.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vrijeme:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cijena:</span>
                        <span className="font-medium">{selectedDoctor.fee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rezervisao/la:</span>
                        <span className="font-medium">{user?.full_name || "Unknown user"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Button className="w-full bg-teal-500 hover:bg-teal-600" onClick={handleBookAppointment}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Potvrdi rezervaciju
                    </Button>
                    <Button variant="outline" className="w-full" onClick={resetBooking}>
                      Počnite ispočetka
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}