
"use client"
import React, { useState, useEffect } from "react";
import { normalizeAppointment } from "@/lib/utils";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestTimeId, setSuggestTimeId] = useState<number|null>(null);
  const [suggestedTime, setSuggestedTime] = useState<string>("");
  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      try {
        // Fetch all appointments for this clinic
        // Assume clinicId is available globally or via context
        const clinicId = window.localStorage.getItem("clinicId") || null;
        let url = "/api/appointments";
        if (clinicId) url += `?clinic_id=${clinicId}`;
        const res = await fetch(url);
  const data = await res.json();
  const normalized = (data || []).map((a: any) => normalizeAppointment(a));
  setAppointments(normalized || []);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  async function handleAction(id: number, action: "accept"|"decline"|"suggest", time?: string) {
    let body: any = { id };
    if (action === "accept") body.status = "accepted";
    if (action === "decline") body.status = "declined";
    if (action === "suggest" && time) { body.suggested_time = time; body.status = "suggested"; }
    await fetch("/api/appointments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    // Refresh list
    const res = await fetch("/api/appointments?status=pending");
  const data = await res.json();
  const normalized = (data || []).map((a: any) => normalizeAppointment(a));
  setAppointments(normalized || []);
    setSuggestTimeId(null);
    setSuggestedTime("");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Svi termini i zahtjevi</h1>
      <p className="text-slate-500 mb-4">Pregled i upravljanje svim zakazanim terminima i zahtjevima za kliniku.</p>
      {loading ? <div>Učitavanje...</div> : (
        appointments.length === 0 ? <div className="text-slate-500">Nema termina.</div> : (
          <div className="space-y-4">
            {appointments.map((appt: any) => (
              <div key={appt.id} className="border rounded-lg p-4 bg-white shadow">
                <div className="font-medium">{appt.users?.full_name || "Nepoznat pacijent"}</div>
                <div>Datum: {new Date(appt.appointment_time).toLocaleDateString()} Vrijeme: {new Date(appt.appointment_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                <div>Doktor: {appt.doctor?.full_name || appt.doctors?.full_name || "Nepoznat"}</div>
                <div>Status: <span className="font-semibold">{appt.status}</span></div>
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={() => handleAction(appt.id, "accept")}>Prihvati</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => handleAction(appt.id, "decline")}>Odbij</button>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => setSuggestTimeId(appt.id)}>Predloži novo vrijeme</button>
                </div>
                {suggestTimeId === appt.id && (
                  <div className="mt-2 flex gap-2 items-center">
                    <input type="datetime-local" value={suggestedTime} onChange={e => setSuggestedTime(e.target.value)} className="border rounded px-2 py-1" />
                    <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => handleAction(appt.id, "suggest", suggestedTime)}>Pošalji prijedlog</button>
                    <button className="px-3 py-1 bg-gray-300 text-black rounded" onClick={() => setSuggestTimeId(null)}>Otkaži</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
