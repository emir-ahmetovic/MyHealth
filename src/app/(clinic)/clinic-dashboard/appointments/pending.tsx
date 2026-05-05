"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function PendingAppointments({ clinicId }: { clinicId: number }) {
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPending = async () => {
    console.log("Fetching pending appointments for clinic:", clinicId);
    try {
      setLoading(true);
      // Add status filter to only get cancel requests
      const res = await fetch(`/api/appointments?clinic_id=${clinicId}&status=cancel_request`);
      if (!res.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await res.json();
      console.log("Fetched appointments:", data);
      setPending(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Greška pri učitavanju termina.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinicId) {
      fetchPending();
    }
  }, [clinicId]);

  const handleApproveCancel = async (appointmentId: number) => {
    if (!appointmentId) {
      console.error("No appointment ID provided");
      return;
    }

    try {
      // First update the appointment status to 'cancelled'
      console.log("Updating appointment status to cancelled:", appointmentId);
      const updateRes = await fetch("/api/appointments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: appointmentId,
          status: "cancelled",
        }),
      });

      if (!updateRes.ok) {
        throw new Error("Failed to update appointment status");
      }

      // Then delete the appointment
      console.log("Deleting appointment:", appointmentId);
      const deleteRes = await fetch(`/api/appointments?id=${appointmentId}`, {
        method: "DELETE",
      });

      if (!deleteRes.ok) {
        throw new Error("Failed to delete appointment");
      }

      console.log("Successfully cancelled and deleted appointment:", appointmentId);
      
      // Remove from the pending list and show success message
      setPending(current => current.filter(a => a.id !== appointmentId));
      alert("Termin je uspješno otkazan.");
      
      // Refresh the list
      fetchPending();
    } catch (error) {
      console.error("Error in handleApproveCancel:", error);
      alert("Greška pri otkazivanju termina. Pokušajte ponovo.");
    }
  }

  if (loading) return <div>Učitavanje...</div>
  if (!pending.length) return <div>Nema zahtjeva za otkazivanje.</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Zahtjevi za otkazivanje termina</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchPending}
        >
          Osvježi
        </Button>
      </div>
      
      <ul className="space-y-4">
        {pending.map(appointment => (
          <li key={appointment.id} className="border p-4 rounded-lg bg-white shadow-sm">
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Pacijent:</span>{" "}
                {appointment.users?.full_name || (appointment.notes?.match(/Ime pacijenta:\s*(.+)/)?.[1] ?? "Nepoznato")}
              </div>
              <div>
                <span className="font-semibold">Doktor:</span>{" "}
                {appointment.doctor?.full_name || appointment.doctors?.full_name || "Nije određeno"}
              </div>
              <div>
                <span className="font-semibold">Datum:</span>{" "}
                {new Date(appointment.appointment_time).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Vrijeme:</span>{" "}
                {new Date(appointment.appointment_time).toLocaleTimeString([], { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                })}
              </div>
              {appointment.cancelled_reason && (
                <div>
                  <span className="font-semibold">Razlog otkazivanja:</span>{" "}
                  {appointment.cancelled_reason}
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                variant="destructive"
                onClick={() => handleApproveCancel(appointment.id)}
              >
                Odobri otkazivanje
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
