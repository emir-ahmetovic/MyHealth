"use client"

import { useState } from "react"
import React from "react"
import { useUser } from "@/components/shared/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useToast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"
const GallerySection = dynamic(() => import("./gallery"), { ssr: false })
import { ClinicGallery } from "@/components/shared/clinic-gallery"

export default function ClinicProfilePage() {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postal, setPostal] = useState("")
  const [website, setWebsite] = useState("")
  const [description, setDescription] = useState("")
  const [license, setLicense] = useState("")
  const [specializations, setSpecializations] = useState<string[]>([])
  const [clinicTypeId, setClinicTypeId] = useState<number | null>(null)
  const [clinicTypes, setClinicTypes] = useState<any[]>([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()
  // Fetch clinic types for dropdown
  React.useEffect(() => {
    async function fetchClinicTypes() {
      const res = await fetch("/api/clinic-types");
      if (!res.ok) return;
      const data = await res.json();
      setClinicTypes(data.clinicTypes || []);
    }
    fetchClinicTypes();
  }, []);

  // Map specializations to clinic types
  const allSpecializations = [
    "Opća medicina",
    "Stomatologija",
    "Dermatologija",
    "Kardiologija",
    "Neurologija",
    "Ortopedija",
    "Ginekologija",
    "Pedijatrija",
    "Oftalmologija",
    "Psihijatrija",
  ];

  function handleSpecializationSelect(spec: string) {
    // Toggle specialization (allow multiple)
        setSpecializations((prev) => {
          let updated;
          if (prev.includes(spec)) {
            updated = prev.filter((s) => s !== spec);
          } else {
            updated = [...prev, spec];
          }
          // Debug log
          console.log('clinicTypes:', clinicTypes);
          console.log('Selected specialization:', updated[0]);
          // Always set clinicTypeId to the first selected specialization's matching type
          if (updated.length === 0) {
            setClinicTypeId(null);
          } else {
            const firstSpec = updated[0];
            const foundType = clinicTypes.find((type: any) => type.name === firstSpec);
            if (foundType) {
              setClinicTypeId(foundType.id);
            } else {
              setClinicTypeId(null);
            }
          }
          return updated;
        });
  }

  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [editingScheduleFor, setEditingScheduleFor] = useState<number | null>(null);
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);
  const [scheduleStart, setScheduleStart] = useState<string>('08:00');
  const [scheduleEnd, setScheduleEnd] = useState<string>('16:00');
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch doctors for selected clinic
  React.useEffect(() => {
    async function fetchDoctorsForClinic() {
      if (!selectedClinicId) {
        setDoctors([]);
        return;
      }
      const docRes = await fetch(`/api/doctors/by-clinic?id=${selectedClinicId}`);
      if (docRes.ok) {
        const docData = await docRes.json();
        setDoctors(docData.doctors || []);
      } else {
        setDoctors([]);
      }
    }
    fetchDoctorsForClinic();
  }, [selectedClinicId]);

  async function fetchClinics() {
    if (!user?.id) return;
    const res = await fetch(`/api/clinics/by-user?id=${user.id}`);
    if (!res.ok) return;
    const data = await res.json();
    setClinics(data.clinics || []);
    if (data.clinics && data.clinics.length > 0) setSelectedClinicId(data.clinics[0].id);
    // Fetch doctors for the first clinic
    if (data.clinics && data.clinics.length > 0) {
      const clinicId = data.clinics[0].id;
      const docRes = await fetch(`/api/doctors/by-clinic?id=${clinicId}`);
      if (docRes.ok) {
        const docData = await docRes.json();
        setDoctors(docData.doctors || []);
      }
    }
  }

  React.useEffect(() => {
    fetchClinics();
  }, [user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!specializations.length) {
      toast({ title: "Greška", description: "Odaberite barem jednu specijalizaciju.", variant: "destructive" });
      return;
    }
    if (!clinicTypeId) {
      toast({ title: "Greška", description: "Odabrana specijalizacija nije povezana s tipom klinike.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const method = selectedClinicId ? "PATCH" : "POST";
      // Combine address and city for DB
      const fullAddress = city ? `${address}, ${city}` : address;
      const body = selectedClinicId
        ? {
            clinic_id: selectedClinicId,
            name,
            address: fullAddress,
            postal,
            website,
            description,
            license,
            specializations,
            user_id: user?.id,
            clinic_type_id: clinicTypeId,
            phone,
            email,
            working_hours: workingHours,
          }
        : {
            name,
            address: fullAddress,
            postal,
            website,
            description,
            license,
            specializations,
            user_id: user?.id,
            clinic_type_id: clinicTypeId,
            phone,
            email,
            working_hours: workingHours,
          };
      console.log('Clinic profile request body:', body);
      const res = await fetch("/api/clinics", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Greška pri spremanju profila.");
      toast({ title: "Profil spremljen", description: "Profil klinike je uspješno spremljen." });
      setIsEditing(false);
      fetchClinics();
    } catch (error: any) {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
  if (!selectedClinicId || !user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/clinics", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic_id: selectedClinicId, user_id: user.id }),
      });
      if (!res.ok) throw new Error("Greška pri brisanju profila.");
      toast({ title: "Profil obrisan", description: "Profil klinike je uspješno obrisan." });
      setSelectedClinicId(null);
      setName("");
      setAddress("");
      setCity("");
      setPostal("");
      setWebsite("");
      setDescription("");
      setLicense("");
      setSpecializations([]);
      setClinicTypeId(null);
      fetchClinics();
    } catch (error: any) {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function toggleSpecialization(spec: string) {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    )
  }

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="mb-6 text-2xl font-bold">Upravljanje profilima klinika</h1>
      <div className="mb-8">
        <div className="flex justify-center mb-4">
          <Button type="button" variant="outline" className="px-6 py-2 rounded-full shadow-md" onClick={() => {
            setSelectedClinicId(null);
            setShowForm(true);
            setName("");
            setAddress("");
            setCity("");
            setPostal("");
            setWebsite("");
            setDescription("");
            setLicense("");
            setSpecializations([]);
            setClinicTypeId(null);
            setPhone("");
            setEmail("");
            setWorkingHours("");
          }}>
            <span className="text-lg font-bold">+ Dodaj kliniku</span>
          </Button>
        </div>
        {showForm && (
          <div className="w-full max-w-lg mx-auto mb-8">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-6 animate-fade-in">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">{selectedClinicId ? "Uredi profil klinike" : "Dodaj novu kliniku"}</h2>
                <div>
                  <Label htmlFor="name">Naziv klinike</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="address">Adresa</Label>
                  <Input id="address" value={address} onChange={e => setAddress(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="working-hours">Radno vrijeme</Label>
                  <Input id="working-hours" value={workingHours} onChange={e => setWorkingHours(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Grad</Label>
                    <Input id="city" value={city} onChange={e => setCity(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="postal">Poštanski broj</Label>
                    <Input id="postal" value={postal} onChange={e => setPostal(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Web stranica</Label>
                  <Input id="website" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="description">Opis klinike</Label>
                  <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="license">Broj licence</Label>
                  <Input id="license" value={license} onChange={e => setLicense(e.target.value)} required />
                </div>
                <div>
                  <Label>Specijalizacije (odaberite tip klinike)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {allSpecializations.map(spec => (
                      <label key={spec} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={specializations.includes(spec)}
                          onChange={() => handleSpecializationSelect(spec)}
                        />
                        {spec}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Fotografije klinike</Label>
                  {/* Show ClinicGallery for new clinic, GallerySection for editing */}
                  {selectedClinicId
                    ? <GallerySection clinicId={selectedClinicId} />
                    : <ClinicGallery images={[]} onAdd={(file: File) => {/* handle upload logic for new clinic here */}} />}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Spremanje..." : selectedClinicId ? "Spremi promjene" : "Spremi profil"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => setShowForm(false)}>
                    Odustani
                  </Button>
                  {selectedClinicId && (
                    <Button type="button" variant="destructive" className="w-full" onClick={handleDelete} disabled={isLoading}>
                      Obriši profil
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <div className="mb-8">
        {clinics.length === 0 ? (
          <div className="text-slate-500">Nema profila klinika.</div>
        ) : (
          <ul className="space-y-4">
            {clinics.map(clinic => (
              <li key={clinic.id} className="p-0 rounded-xl shadow-lg bg-white border border-slate-200 flex flex-col md:flex-row gap-0 overflow-hidden">
                  {/* Gallery preview removed from profile display */}
                <div className="md:w-2/3 p-6 flex flex-col gap-2">
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="text-xl font-bold text-slate-800">{clinic.name}</div>
                    <div className="text-sm text-slate-600">{clinic.address}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-2">
                    {clinic.phone && <div>📞 {clinic.phone}</div>}
                    {clinic.email && <div>✉️ {clinic.email}</div>}
                    {clinic.working_hours && <div>🕒 {clinic.working_hours}</div>}
                    {clinic.city && <div>🏙️ {clinic.city}</div>}
                    {clinic.postal && <div>📮 {clinic.postal}</div>}
                    {clinic.website && <div>🌐 <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="underline">{clinic.website}</a></div>}
                  </div>
                  {clinic.description && <div className="text-sm text-slate-700 mb-2">{clinic.description}</div>}
                  {clinic.license && <div className="text-xs text-slate500">Licenca: {clinic.license}</div>}
                  {clinic.specializations && clinic.specializations.length > 0 && (
                    <div className="text-xs text-slate-500">Specijalizacije: {clinic.specializations.join(", ")}</div>
                  )}
                  {clinic.clinic_type_id && <div className="text-xs text-slate-500">Tip klinike: {clinic.clinic_type_id}</div>}
                  {/* Doctors section */}
                  {selectedClinicId === clinic.id && doctors.length > 0 && (
                    <div className="mt-4">
                      <div className="font-semibold">Doktori:</div>
                      <ul className="space-y-2">
                        {doctors.map(doc => (
                          <li key={doc.id} className="text-sm text-slate-700">
                            <span className="font-bold">{doc.full_name}</span> - {doc.specialization} <span className="text-xs text-slate-400">Licenca: {doc.license_number}</span>
                            {doc.bio && <div className="text-xs text-slate-500">{doc.bio}</div>}
                              <div className="mt-2 flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={async () => {
                                  // Toggle inline schedule editor for this doctor
                                  if (editingScheduleFor === doc.id) {
                                    setEditingScheduleFor(null);
                                    return;
                                  }
                                  setEditingScheduleFor(doc.id);
                                  // Try to load existing schedule
                                  try {
                                    const res = await fetch(`/api/doctor-schedule?doctorId=${doc.id}`);
                                    if (res.ok) {
                                      const data = await res.json();
                                      const sched = data.schedule || [];
                                      // Prefill selected days and times (if consistent)
                                      const days = sched.map((s: any) => Number(s.day_of_week));
                                      setScheduleDays(days);
                                      if (sched.length > 0) {
                                        // If all entries share same times, prefill start/end
                                        const allStart = sched.map((s: any) => s.start_time.replace(/:\d{2}$/, ''));
                                        const allEnd = sched.map((s: any) => s.end_time.replace(/:\d{2}$/, ''));
                                        if (allStart.every((v: any) => v === allStart[0])) setScheduleStart(allStart[0]);
                                        if (allEnd.every((v: any) => v === allEnd[0])) setScheduleEnd(allEnd[0]);
                                      }
                                    }
                                  } catch (e) {
                                    // ignore
                                  }
                                }}>Uredi raspored</Button>
                                {editingScheduleFor === doc.id && (
                                  <div className="mt-3 w-full rounded-md bg-slate-50 p-3">
                                    <div className="mb-2 text-sm font-medium">Radni dani</div>
                                    <div className="grid grid-cols-7 gap-1 mb-2 text-xs">
                                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, idx) => (
                                        <label key={d} className={`cursor-pointer rounded px-2 py-1 text-center ${scheduleDays.includes(idx) ? 'bg-teal-500 text-white' : 'bg-white text-slate-700 border'}`}>
                                          <input type="checkbox" className="hidden" checked={scheduleDays.includes(idx)} onChange={(e) => {
                                            if (e.target.checked) setScheduleDays(prev => Array.from(new Set([...prev, idx])));
                                            else setScheduleDays(prev => prev.filter(x => x !== idx));
                                          }} />
                                          {d}
                                        </label>
                                      ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 items-end mb-3">
                                      <div>
                                        <Label>Početak</Label>
                                        <Input type="time" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} />
                                      </div>
                                      <div>
                                        <Label>Kraj</Label>
                                        <Input type="time" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={async () => {
                                        if (!scheduleDays.length) return;
                                        const payload = { doctorId: doc.id, schedules: scheduleDays.map(dow => ({ day_of_week: dow, start_time: scheduleStart, end_time: scheduleEnd })) };
                                        try {
                                          const res = await fetch('/api/doctor-schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                                          if (res.ok) {
                                            const data = await res.json();
                                            // update local doctors list to reflect new workingDays
                                            setDoctors(prev => prev.map(p => p.id === doc.id ? { ...p, workingDays: (data.schedule || []).map((s: any) => { const dn = Number(s.day_of_week); return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dn]; }) } : p));
                                            setEditingScheduleFor(null);
                                            toast({ title: 'Raspored spremljen', description: 'Raspored doktora je ažuriran.' });
                                          } else {
                                            const err = await res.json();
                                            toast({ title: 'Greška', description: err.error || 'Neuspjelo spremanje', variant: 'destructive' });
                                          }
                                        } catch (e) {
                                          toast({ title: 'Greška', description: 'Greška pri spremanju rasporeda', variant: 'destructive' });
                                        }
                                      }}>Spremi</Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingScheduleFor(null)}>Otkaži</Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => {
                      setSelectedClinicId(clinic.id);
                      setName(clinic.name);
                      setAddress(clinic.address);
                      setCity(clinic.city || "");
                      setPostal(clinic.postal || "");
                      setWebsite(clinic.website || "");
                      setDescription(clinic.description || "");
                      setLicense(clinic.license || "");
                      setSpecializations(clinic.specializations || []);
                      setClinicTypeId(clinic.clinic_type_id || null);
                      setShowForm(true);
                    }}>Uredi</Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      setSelectedClinicId(clinic.id);
                      handleDelete();
                    }}>Obriši</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
