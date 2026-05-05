"use client"
import React, { useState, useEffect } from "react"

interface BookingSectionProps {
  clinicId: number
  patientId: number
}

export const BookingSection: React.FC<BookingSectionProps> = ({ clinicId, patientId }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (selectedDate) {
      fetch(`/api/appointments?clinic_id=${clinicId}&date=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          setTakenSlots(data.map((a: any) => new Date(a.appointment_time).toISOString().slice(11, 16)));
        });
    }
  }, [selectedDate, clinicId]);

  const handleBook = async () => {
    setLoading(true);
    setMessage("");
    const appointment_time = `${selectedDate}T${selectedTime}:00.000Z`;
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patientId,
        clinic_id: clinicId,
        appointment_time,
      }),
    });
    const result = await res.json();
    if (res.ok) {
      setMessage("Termin je uspješno rezervisan!");
      setTakenSlots([...takenSlots, selectedTime]);
    } else {
      setMessage(result.error || "Greška pri rezervaciji.");
    }
    setLoading(false);
  };

  // Example time slots
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"
  ];

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h2 className="text-lg font-bold mb-2">Rezerviši termin</h2>
      <input
        type="date"
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <div className="mb-2 flex gap-2">
        {timeSlots.map(slot => (
          <button
            key={slot}
            disabled={takenSlots.includes(slot) || !selectedDate}
            onClick={() => setSelectedTime(slot)}
            className={`p-2 rounded border ${takenSlots.includes(slot) ? "bg-gray-200 text-gray-400" : selectedTime === slot ? "bg-teal-500 text-white" : "bg-white"}`}
          >
            {slot}
          </button>
        ))}
      </div>
      <button
        onClick={handleBook}
        disabled={!selectedDate || !selectedTime || loading}
        className="p-2 bg-teal-500 text-white rounded"
      >
        {loading ? "Rezervišem..." : "Rezerviši"}
      </button>
      {message && <div className="mt-2 text-sm">{message}</div>}
    </div>
  );
}
