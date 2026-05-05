"use client"

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export default function AppointmentsDashboard() {
	const [appointments, setAppointments] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchDashboardAppointments() {
			setLoading(true);
			try {
				const res = await fetch("/api/dashboard-data");
				const data = await res.json();
				setAppointments(data.appointments || []);
			} catch {
				setAppointments([]);
			} finally {
				setLoading(false);
			}
		}
		fetchDashboardAppointments();
	}, []);

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "confirmed":
				return <Badge className="bg-teal-500">Potvrđeno</Badge>;
			case "pending":
				return <Badge className="bg-amber-500">Na čekanju</Badge>;
			case "completed":
				return <Badge variant="outline">Završeno</Badge>;
			case "cancelled":
				return <Badge variant="destructive">Otkazano</Badge>;
			case "cancel_request":
				return <Badge variant="destructive">Zahtjev za otkazivanje</Badge>;
			case "move_request":
				return <Badge className="bg-yellow-500">Zahtjev za pomjeranje</Badge>;
			default:
				return null;
		}
	};

	// Nadolazeći termini: today and future, not pending
	const now = new Date();
	const upcoming = appointments
		.filter(a => a.status !== "pending" && a.status !== "declined" && a.status !== "cancelled" && new Date(a.appointment_time) > now)
		.sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime())
		.slice(0, 5);

	// All requests: pending, cancel_request, move_request, but not declined/cancelled
	const requests = appointments.filter(a => ["pending","cancel_request","move_request"].includes(a.status) && a.status !== "declined" && a.status !== "cancelled");

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">Termini</h1>
			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-2">Nadolazeći termini</h2>
				{loading ? <div>Učitavanje...</div> : upcoming.length === 0 ? (
					<div className="text-slate-500">Nema nadolazećih termina.</div>
				) : (
					<div className="space-y-4">
						{upcoming.map((appointment: any) => (
							<div key={appointment.id} className="border rounded-lg p-4 bg-white shadow">
								<div className="font-medium">Pacijent: {appointment.users?.full_name || "Nepoznat pacijent"}</div>
																				<div>
																						Datum: {new Date(appointment.appointment_time).toLocaleDateString('en-GB')} Vrijeme: {new Date(appointment.appointment_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
																						</div>
																						<div>
																							Doktor: {appointment.doctor?.full_name || appointment.doctors?.full_name || appointment.doctorName || "Nepoznat"}
																						</div>
												{getStatusBadge(appointment.status)}
							</div>
						))}
					</div>
				)}
			</div>
			<div>
				<h2 className="text-xl font-semibold mb-2">Zahtjevi</h2>
				{loading ? <div>Učitavanje...</div> : requests.length === 0 ? (
					<div className="text-slate-500">Nema zahtjeva za termine.</div>
				) : (
					<div className="space-y-4">
						{requests.map((appointment: any) => (
							<div key={appointment.id} className="border rounded-lg p-4 bg-white shadow">
								<div className="font-medium">Pacijent: {appointment.users?.full_name || "Nepoznat pacijent"}</div>
												<div>
													Datum: {new Date(appointment.appointment_time).toLocaleDateString()} Vrijeme: {new Date(appointment.appointment_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
												</div>
												<div>
													Doktor: {appointment.doctors?.full_name || appointment.doctor?.full_name || appointment.doctorName || "Nepoznat"}
												</div>
												{getStatusBadge(appointment.status)}
								{appointment.status === 'cancel_request' && (
									<div className="mt-2 text-sm text-red-600 font-semibold">Zahtjev za otkazivanje{appointment.cancelled_reason ? `: ${appointment.cancelled_reason}` : ''}</div>
								)}
								{appointment.status === 'move_request' && (
									<div className="mt-2 text-sm text-yellow-600 font-semibold">Zahtjev za pomjeranje termina{appointment.suggested_time ? ` na ${appointment.suggested_time}` : ''}</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
