"use client"

import { useState } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/components/shared/user-context"

export default function ClinicDoctorsPage() {
  const { user } = useUser()
  const [fullName, setFullName] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [bio, setBio] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null)
  const { toast } = useToast()

  async function handleAddDoctor(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!selectedClinicId) throw new Error("Odaberite kliniku.");
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          specialization,
          license_number: licenseNumber,
          bio,
          clinic_id: selectedClinicId,
        }),
      });
      if (!res.ok) throw new Error("Greška pri dodavanju doktora.");
      const data = await res.json();
      setDoctors(prev => [...prev, data.doctor]);
      toast({ title: "Doktor dodan", description: "Doktor je uspješno dodan." });
      setFullName("");
      setSpecialization("");
      setLicenseNumber("");
      setBio("");
    } catch (error: any) {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch doctors for this clinic on mount
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editLicenseNumber, setEditLicenseNumber] = useState("");
  const [editBio, setEditBio] = useState("");

  async function fetchDoctors() {
    // Fetch all clinics for user
    const clinicRes = await fetch(`/api/clinics/by-user?id=${user?.id}`);
    if (!clinicRes.ok) return;
    const clinicData = await clinicRes.json();
    setClinics(clinicData.clinics || []);
    // Fetch all doctors for all clinics
    let allDoctors: any[] = [];
    for (const clinic of clinicData.clinics || []) {
      const res = await fetch(`/api/doctors/by-clinic?id=${clinic.id}`);
      if (res.ok) {
        const data = await res.json();
        allDoctors = allDoctors.concat(data.doctors.map((doc: any) => ({ ...doc, clinic })))
      }
    }
    setDoctors(allDoctors);
  }

  // Fetch doctors on mount
  React.useEffect(() => {
    if (user?.id) fetchDoctors();
  }, [user?.id, selectedClinicId]);

  async function handleDeleteDoctor(doctorId: number) {
    setIsLoading(true);
    try {
  const clinicRes = await fetch(`/api/clinics/by-user?id=${user?.id}`);
  if (!clinicRes.ok) throw new Error("Greška pri dohvaćanju klinike.");
  const clinicData = await clinicRes.json();
  const clinicId = clinicData.clinics?.[0]?.id;
  if (!clinicId) throw new Error("Klinika nije pronađena.");
      const res = await fetch("/api/doctors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id: doctorId, clinic_id: clinicId }),
      });
      if (!res.ok) throw new Error("Greška pri brisanju doktora.");
      setDoctors(prev => prev.filter(doc => doc.id !== doctorId));
      toast({ title: "Doktor obrisan", description: "Doktor je uspješno uklonjen." });
    } catch (error: any) {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function startEditDoctor(doc: any) {
    setEditingId(doc.id);
    setEditFullName(doc.full_name);
    setEditSpecialization(doc.specialization);
    setEditLicenseNumber(doc.license_number);
    setEditBio(doc.bio);
  }

  async function handleEditDoctor(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
  const clinicRes = await fetch(`/api/clinics/by-user?id=${user?.id}`);
  if (!clinicRes.ok) throw new Error("Greška pri dohvaćanju klinike.");
  const clinicData = await clinicRes.json();
  const clinicId = clinicData.clinics?.[0]?.id;
  if (!clinicId) throw new Error("Klinika nije pronađena.");
      const res = await fetch("/api/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: editingId,
          full_name: editFullName,
          specialization: editSpecialization,
          license_number: editLicenseNumber,
          bio: editBio,
          clinic_id: clinicId,
        }),
      });
      if (!res.ok) throw new Error("Greška pri uređivanju doktora.");
      const data = await res.json();
      setDoctors(prev => prev.map(doc => doc.id === editingId ? data.doctor : doc));
      toast({ title: "Doktor uređen", description: "Podaci su uspješno ažurirani." });
      setEditingId(null);
    } catch (error: any) {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="mb-6 text-2xl font-bold">Dodaj doktora</h1>
      <form onSubmit={handleAddDoctor} className="space-y-6">
        <div>
          <Label htmlFor="clinic">Klinika</Label>
          <select
            id="clinic"
            value={selectedClinicId ?? ""}
            onChange={e => setSelectedClinicId(Number(e.target.value))}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="" disabled>Odaberite kliniku</option>
            {clinics.map((clinic: any) => (
              <option key={clinic.id} value={clinic.id}>{clinic.name} - {clinic.address}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="fullName">Ime i prezime</Label>
          <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="specialization">Specijalizacija</Label>
          <Input id="specialization" value={specialization} onChange={e => setSpecialization(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="licenseNumber">Broj licence</Label>
          <Input id="licenseNumber" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="bio">Biografija</Label>
          <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Spremanje..." : "Dodaj doktora"}
        </Button>
      </form>
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">Svi doktori</h2>
        <ul className="space-y-4">
          {doctors.map((doc, i) => (
            <li key={doc.id || i} className="p-4 border rounded-lg bg-slate-50">
              <div className="mb-2 text-xs text-slate-500">Klinika: {doc.clinic?.name} ({doc.clinic?.address})</div>
              {editingId === doc.id ? (
                <form onSubmit={handleEditDoctor} className="space-y-2">
                  <Input value={editFullName} onChange={e => setEditFullName(e.target.value)} required />
                  <Input value={editSpecialization} onChange={e => setEditSpecialization(e.target.value)} required />
                  <Input value={editLicenseNumber} onChange={e => setEditLicenseNumber(e.target.value)} required />
                  <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>Spremi</Button>
                    <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Odustani</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="font-bold">{doc.full_name}</div>
                  <div className="text-sm text-slate-600">{doc.specialization}</div>
                  <div className="text-xs text-slate-400">Licenca: {doc.license_number}</div>
                  <div className="mt-2 text-sm">{doc.bio}</div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => startEditDoctor(doc)}>Uredi</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteDoctor(doc.id)} disabled={isLoading}>Obriši</Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
