"use client"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { useUser } from "@/components/shared/user-context"

export default function ClinicCalendarPage() {
  const { user } = useUser();
  const [clinics, setClinics] = useState<any[]>([]);
  const [clinicId, setClinicId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [timeslots, setTimeslots] = useState<any[]>([]);
  const [loadingTimeslots, setLoadingTimeslots] = useState(false);
  
  // Add appointment handler
  async function handleAddAppointment() {
    if (!doctorId || !selectedDate || !selectedTime || !patientName || !clinicId) return;
    try {
      const appointmentDate = new Date(selectedDate);
      // Set time from selectedTime string (HH:mm)
      const [hour, minute] = selectedTime.split(":").map(Number);
      appointmentDate.setHours(hour, minute, 0, 0);
  // For manual entry, patient_id is null
  const patientId = null;
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          clinic_id: clinicId,
          doctor_id: doctorId ? Number(doctorId) : null,
          appointment_time: appointmentDate.toISOString(),
          timeslot: selectedTime,
          notes: comment,
          patient_name: patientName, // For reference, not stored in DB
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Greška pri kreiranju termina.");
        return;
      }
      alert("Termin je uspješno kreiran.");
      setShowAdd(false);
      setSelectedTime("");
      setPatientName("");
      setComment("");
      // Refresh appointments for selected date
      const dateStr = selectedDate ? selectedDate.toISOString().slice(0, 10) : "";
      let url = `/api/appointments?date=${dateStr}&clinic_id=${clinicId}`;
      if (doctorId && !isNaN(Number(doctorId))) {
        url += `&doctor_id=${Number(doctorId)}`;
      }
      const getRes = await fetch(url);
      const getData = await getRes.json();
      setAppointments(
        (getData || []).map((a: any) => {
          let note = a.notes || "";
          let patientDisplay =
            a.users?.full_name
            || (note.includes('Ime pacijenta:') ? (note.match(/Ime pacijenta:\s*([^\n]+)/)?.[1]?.trim() || "")
            : "")
            || a.patient_id
            || "Unknown";
          return {
            id: a.id,
            patient: patientDisplay,
            patientEmail: a.users?.email || "",
            patientPhone: a.users?.phone || "",
            time: a.appointment_time ? new Date(a.appointment_time) : null,
            note,
            clinic_id: a.clinic_id,
            doctor_id: a.doctor_id,
            status: a.status,
          };
        })
      );
    } catch (error) {
      alert("Greška pri kreiranju termina.");
    }
  }

  useEffect(() => {
    async function fetchClinicsAndDoctors() {
      if (user && user.role === "CLINIC") {
        const res = await fetch(`/api/clinics/by-user?id=${user.id}`);
        const data = await res.json();
        const clinicsArr = data.clinics || [];
        setClinics(clinicsArr);
        // If only one clinic, auto-select it
        if (clinicsArr.length === 1 && !clinicId) {
          setClinicId(clinicsArr[0].id);
        }
        if ((clinicsArr.length > 1 && clinicId) || (clinicsArr.length === 1 && clinicId)) {
          const res2 = await fetch(`/api/doctors/by-clinic?id=${clinicId}`);
          const data2 = await res2.json();
          const doctorsArr = data2.doctors || [];
          setDoctors(doctorsArr);
          // If only one doctor, auto-select it
          if (doctorsArr.length === 1 && !doctorId) {
            setDoctorId(doctorsArr[0].id.toString());
          }
        } else {
          setDoctors([]);
        }
      }
    }
    fetchClinicsAndDoctors();
    // Only reset doctorId and selectedDate if clinicId changes by user action
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, clinicId]);

  useEffect(() => {
    async function fetchAppointmentsForDate() {
      if (!selectedDate || !clinicId || !doctorId || isNaN(Number(doctorId))) {
        setAppointments([]);
        return;
      }
      setLoading(true);
      try {
        // Use local date boundaries for API query
        const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0);
        const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1, 0, 0, 0, 0);
        let url = `/api/appointments?clinic_id=${clinicId}&doctor_id=${Number(doctorId)}&start=${start.toISOString()}&end=${end.toISOString()}`;
        const res = await fetch(url);
        const data = await res.json();
        setAppointments(
          (data || []).map((a: any) => {
            let patientDisplay = a.users?.full_name || a.patient_id || "Unknown";
            let note = a.notes || "";
            if (note.includes('Ime pacijenta:')) {
              const match = note.match(/Ime pacijenta:\s*([^\n]+)/);
              if (match) patientDisplay = match[1].trim();
            }
            return {
              id: a.id,
              patient: patientDisplay,
              patientEmail: a.users?.email || "",
              patientPhone: a.users?.phone || "",
              time: a.appointment_time ? new Date(a.appointment_time) : null,
              note,
              clinic_id: a.clinic_id,
              doctor_id: a.doctor_id,
              status: a.status,
            };
          })
        );
      } catch (error) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointmentsForDate();
  }, [selectedDate, clinicId, doctorId]);
  useEffect(() => {
    async function fetchTimeslots() {
      if (!doctorId || !selectedDate || !clinicId) return;
      setLoadingTimeslots(true);
      try {
        const res = await fetch(`/api/timeslots?date=${selectedDate.toISOString().slice(0, 10)}&clinic_id=${clinicId}&doctor_id=${doctorId}`);
        const data = await res.json();
        setTimeslots(data.timeslots || []);
      } catch (error) {
        setTimeslots([]);
      } finally {
        setLoadingTimeslots(false);
      }
    }
    fetchTimeslots();
  }, [doctorId, selectedDate, clinicId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Kalendar termina</h1>
      <p className="text-slate-500 mb-6">Pregled i upravljanje svim terminima klinike. Dodajte nove termine ili pregledajte postojeće.</p>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Pretraga po imenu pacijenta"
          className="mb-2 w-full p-2 border rounded"
          onChange={async e => {
            const val = e.currentTarget.value.trim();
            if (val.length === 0) {
              // Reload appointments for selected date (if doctor and date selected)
              if (selectedDate && clinicId && doctorId && !isNaN(Number(doctorId))) {
                const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0);
                const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1, 0, 0, 0, 0);
                let url = `/api/appointments?clinic_id=${clinicId}&doctor_id=${Number(doctorId)}&start=${start.toISOString()}&end=${end.toISOString()}`;
                const res = await fetch(url);
                const data = await res.json();
                setAppointments(
                  (data || []).map((a: any) => {
                    let patientDisplay = a.users?.full_name || a.patient_id || "Unknown";
                    let note = a.notes || "";
                    if (note.includes('Ime pacijenta:')) {
                      const match = note.match(/Ime pacijenta:\s*([^\n]+)/);
                      if (match) patientDisplay = match[1].trim();
                    }
                    return {
                      id: a.id,
                      patient: patientDisplay,
                      patientEmail: a.users?.email || "",
                      patientPhone: a.users?.phone || "",
                      time: a.appointment_time ? new Date(a.appointment_time) : null,
                      note,
                      clinic_id: a.clinic_id,
                      doctor_id: a.doctor_id,
                      status: a.status,
                    };
                  })
                );
              } else {
                setAppointments([]);
              }
              return;
            }
            // Show results as soon as name and clinic are set
            if (clinicId) {
              let url = `/api/appointments?patient_name=${encodeURIComponent(val)}&clinic_id=${clinicId}`;
              const res = await fetch(url);
              const data = await res.json();
              setAppointments(
                (data || []).map((a: any) => {
                  let patientDisplay = a.users?.full_name || a.patient_id || "Unknown";
                  let note = a.notes || "";
                  if (note.includes('Ime pacijenta:')) {
                    const match = note.match(/Ime pacijenta:\s*([^\n]+)/);
                    if (match) patientDisplay = match[1].trim();
                  }
                  return {
                    id: a.id,
                    patient: patientDisplay,
                    patientEmail: a.users?.email || "",
                    patientPhone: a.users?.phone || "",
                    time: a.appointment_time ? new Date(a.appointment_time) : null,
                    note,
                    clinic_id: a.clinic_id,
                    doctor_id: a.doctor_id,
                    status: a.status,
                  };
                })
              );
            } else {
              setAppointments([]);
            }
          }}
        />
      </div>
      {/* 1. Select clinic (if multiple) or show selected clinic if only one */}
      {clinics.length === 1 && clinicId && (
        <div className="mb-4">
          <div className="font-semibold mb-2">Klinika: {clinics[0].name} ({clinics[0].address})</div>
        </div>
      )}
      {clinics.length > 1 && (
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Odaberite kliniku</label>
          <select
            className="mb-2 w-full p-2 border rounded"
            value={clinicId ?? ""}
            onChange={e => { setClinicId(Number(e.target.value)); setDoctorId(""); setSelectedDate(undefined); setSelectedTime(""); setPatientName(""); }}
          >
            <option value="">Odaberite kliniku</option>
            {clinics.map((clinic: any) => (
              <option key={clinic.id} value={clinic.id}>{clinic.name} ({clinic.address})</option>
            ))}
          </select>
        </div>
      )}
      {/* 2. Select doctor (after clinic) or show selected doctor if only one */}
      {clinicId && doctors.length === 1 && doctorId && (
        <div className="mb-4">
          <div className="font-semibold mb-2">Doktor: {doctors[0].full_name} ({doctors[0].specialization})</div>
        </div>
      )}
      {clinicId && doctors.length > 1 && (
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Odaberite doktora</label>
          <select
            className="mb-2 w-full p-2 border rounded"
            value={doctorId}
            onChange={e => { setDoctorId(e.target.value); setSelectedDate(undefined); setSelectedTime(""); setPatientName(""); }}
          >
            <option value="">Odaberite doktora</option>
            {doctors.map((doc: any) => (
              <option key={doc.id} value={doc.id}>{doc.full_name} ({doc.specialization})</option>
            ))}
          </select>
        </div>
      )}
      {/* 3. Select date (after doctor) */}
      {clinicId && doctorId && (
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Odaberite datum</label>
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
        </div>
      )}
      {/* 4. Select time (after date) and show appointments */}
      {clinicId && doctorId && selectedDate && (
        <>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Termini za {selectedDate?.toLocaleDateString("bs")}</h2>
            <Button onClick={() => setShowAdd(true)}>
              {user?.role === "PATIENT" ? "Rezerviši termin" : "Dodaj termin"}
            </Button>
          </div>
          {/* Appointment list for selected date */}
          <div className="space-y-2">
            {loading ? (
              <p className="text-slate-500">Učitavanje termina...</p>
            ) : appointments.length === 0 ? (
              <p className="text-slate-500">Nema termina za ovaj dan.</p>
            ) : (
              <div className="space-y-2">
                {appointments.map(a => (
                  <div key={a.id} className="p-3 border rounded-lg bg-white flex justify-between items-center">
                    <div>
                      <div className="font-medium">Pacijent: {a.patient}</div>
                      <div className="text-sm text-slate-500">
                        {a.time ? `${a.time.getHours().toString().padStart(2, "0")}:${a.time.getMinutes().toString().padStart(2, "0")}` : ""}
                      </div>
                      <div className="text-sm text-slate-500">
                        {a.patientEmail && <span>Email: {a.patientEmail}</span>}
                        {a.patientPhone && <span className="ml-2">Telefon: {a.patientPhone}</span>}
                      </div>
                      {a.note && <div className="text-xs text-slate-400 whitespace-pre-line">{a.note}</div>}
                      {/* Show reason for cancel/move request if present */}
                      {(a.status === 'cancel_request' || a.status === 'move_request') && a.note && (
                        <div className="text-xs text-red-500 mt-1">
                          {a.status === 'cancel_request' ? 'Zahtjev za otkazivanje' : 'Zahtjev za pomjeranje'}: {a.note}
                        </div>
                      )}
                    </div>
                    {user?.role === "CLINIC" ? (
                      (a.status === 'cancel_request' || a.status === 'move_request') ? (
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={async () => {
                            // Approve: delete the appointment from the database
                            try {
                              console.log('Sending DELETE for appointment', a.id);
                              const res = await fetch(`/api/appointments?id=${a.id}`, { method: "DELETE" });
                              console.log('DELETE response status', res.status);
                              let result: { success?: boolean; error?: string; details?: string } = {};
                              try {
                                result = await res.json();
                              } catch (e) {
                                console.error('Failed to parse DELETE response', e);
                              }
                              console.log('DELETE response body', result);
                              if (res.ok && result.success) {
                                alert('Zahtjev odobren i termin je obrisan.');
                                // Refresh appointments from server to ensure UI is in sync
                                const start = new Date(selectedDate!.getFullYear(), selectedDate!.getMonth(), selectedDate!.getDate(), 0, 0, 0, 0);
                                const end = new Date(selectedDate!.getFullYear(), selectedDate!.getMonth(), selectedDate!.getDate() + 1, 0, 0, 0, 0);
                                let url = `/api/appointments?clinic_id=${clinicId}&doctor_id=${Number(doctorId)}&start=${start.toISOString()}&end=${end.toISOString()}`;
                                const res2 = await fetch(url);
                                const data2 = await res2.json();
                                setAppointments(
                                  (data2 || []).map((a: any) => {
                                    let patientDisplay = a.users?.full_name || a.patient_id || "Unknown";
                                    let note = a.notes || "";
                                    if (note.includes('Ime pacijenta:')) {
                                      const match = note.match(/Ime pacijenta:\s*([^\n]+)/);
                                      if (match) patientDisplay = match[1].trim();
                                    }
                                    return {
                                      id: a.id,
                                      patient: patientDisplay,
                                      patientEmail: a.users?.email || "",
                                      patientPhone: a.users?.phone || "",
                                      time: a.appointment_time ? new Date(a.appointment_time) : null,
                                      note,
                                      clinic_id: a.clinic_id,
                                      doctor_id: a.doctor_id,
                                      status: a.status,
                                    };
                                  })
                                );
                              } else {
                                alert('Greška pri odobravanju zahtjeva. Status: ' + res.status + '\n' + JSON.stringify(result));
                                // Optionally log for debugging
                                console.error('Delete failed', result);
                              }
                            } catch (err: any) {
                              alert('Greška pri slanju DELETE zahtjeva: ' + (err && typeof err === 'object' && 'message' in err ? err.message : String(err)));
                              console.error('DELETE request error', err);
                            }
                          }}>
                            Odobri
                          </Button>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            // Decline: set status back to 'scheduled'
                            const res = await fetch('/api/appointments', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: a.id, status: 'scheduled' })
                            });
                            if (res.ok) {
                              alert('Zahtjev odbijen.');
                              // Refresh appointments
                              const start = new Date(selectedDate!.getFullYear(), selectedDate!.getMonth(), selectedDate!.getDate(), 0, 0, 0, 0);
                              const end = new Date(selectedDate!.getFullYear(), selectedDate!.getMonth(), selectedDate!.getDate() + 1, 0, 0, 0, 0);
                              let url = `/api/appointments?clinic_id=${clinicId}&doctor_id=${Number(doctorId)}&start=${start.toISOString()}&end=${end.toISOString()}`;
                              const res2 = await fetch(url);
                              const data2 = await res2.json();
                              setAppointments(
                                (data2 || []).map((a: any) => {
                                  let patientDisplay = a.users?.full_name || a.patient_id || "Unknown";
                                  let note = a.notes || "";
                                  if (note.includes('Ime pacijenta:')) {
                                    const match = note.match(/Ime pacijenta:\s*([^\n]+)/);
                                    if (match) patientDisplay = match[1].trim();
                                  }
                                  return {
                                    id: a.id,
                                    patient: patientDisplay,
                                    patientEmail: a.users?.email || "",
                                    patientPhone: a.users?.phone || "",
                                    time: a.appointment_time ? new Date(a.appointment_time) : null,
                                    note,
                                    clinic_id: a.clinic_id,
                                    doctor_id: a.doctor_id,
                                    status: a.status,
                                  };
                                })
                              );
                            } else {
                              alert('Greška pri odbijanju zahtjeva.');
                            }
                          }}>
                            Odbij
                          </Button>
                        </div>
                      ) : (
                        <Button variant="destructive" size="sm" onClick={async () => {
                          if (confirm("Obrisati termin?")) {
                            await fetch(`/api/appointments?id=${a.id}`, { method: "DELETE" });
                            // Refresh appointments
                            const start = new Date(selectedDate!.getFullYear(), selectedDate!.getMonth(), selectedDate!.getDate(), 0, 0, 0, 0);
                            const end = new Date(selectedDate!.getFullYear(), selectedDate!.getMonth(), selectedDate!.getDate() + 1, 0, 0, 0, 0);
                            let url = `/api/appointments?clinic_id=${clinicId}&doctor_id=${Number(doctorId)}&start=${start.toISOString()}&end=${end.toISOString()}`;
                            const res = await fetch(url);
                            const data = await res.json();
                            setAppointments(
                              (data || []).map((a: any) => {
                                let patientDisplay = a.patient_id;
                                let note = a.notes || "";
                                if (note.includes('Ime pacijenta:')) {
                                  const match = note.match(/Ime pacijenta:\s*([^\n]+)/);
                                  if (match) patientDisplay = match[1].trim();
                                }
                                return {
                                  id: a.id,
                                  patient: patientDisplay,
                                  time: a.appointment_time ? new Date(a.appointment_time) : null,
                                  note,
                                  clinic_id: a.clinic_id,
                                  doctor_id: a.doctor_id,
                                  status: a.status,
                                  users: a.users,
                                };
                              })
                            );
                          }
                        }}>Obriši</Button>
                      )
                    ) : (
                      <Button variant="outline" size="sm" onClick={async () => {
                        const reason = prompt('Unesite razlog za otkazivanje termina (opcionalno):');
                        const res = await fetch('/api/appointments', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: a.id, status: 'cancel_request', cancel_reason: reason })
                        });
                        if (res.ok) {
                          alert('Zahtjev za otkazivanje termina je poslan.');
                        } else {
                          alert('Greška pri slanju zahtjeva.');
                        }
                      }}>
                        Zatraži otkazivanje
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Time slot selection for new appointment */}
          {showAdd && user?.role === "CLINIC" && (
            <div className="mb-4 p-4 border rounded-lg bg-slate-50">
              <div className="mb-2 font-semibold">Odaberite termin</div>
              <select
                className="mb-2 w-full p-2 border rounded"
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
                disabled={loadingTimeslots}
              >
                <option value="">Odaberite termin</option>
                {Array.from({ length: 16 }, (_, i) => 8 * 60 + i * 30).map(mins => {
                  const hour = Math.floor(mins / 60);
                  const minute = mins % 60;
                  const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                  const slotTaken = appointments.some(a => {
                    const aDate = new Date(a.time);
                    return aDate.getHours() === hour && aDate.getMinutes() === minute;
                  });
                  return (
                    <option key={timeStr} value={timeStr} disabled={slotTaken}>
                      {timeStr} {slotTaken ? "(Zauzeto)" : ""}
                    </option>
                  );
                })}
              </select>
              <div className="mb-2 font-semibold">Unesite ime pacijenta</div>
              <input
                type="text"
                placeholder="Ime pacijenta"
                className="mb-2 w-full p-2 border rounded"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
              />
              <div className="mb-2 font-semibold">Komentar (opcionalno)</div>
              <textarea
                placeholder="Unesite komentar ili napomenu (opcionalno)"
                className="mb-2 w-full p-2 border rounded"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <Button className="mr-2" onClick={handleAddAppointment} disabled={!selectedTime || !patientName}>Spremi</Button>
              <Button variant="outline" onClick={() => { setShowAdd(false); setSelectedTime(""); setPatientName(""); setComment(""); }}>Otkaži</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
