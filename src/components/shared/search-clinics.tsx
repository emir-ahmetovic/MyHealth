"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"

export function SearchClinics() {
  const [date, setDate] = useState<Date>();
  const [city, setCity] = useState<string | undefined>();
  const [specialization, setSpecialization] = useState<string | undefined>();
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const cities = ["Sarajevo", "Bihać", "Banja Luka", "Tuzla", "Zenica", "Mostar", "Bijeljina", "Prijedor", "Brčko"];
  const specializations = [
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

  async function handleSearch() {
    setLoading(true);
    const res = await fetch("/api/search-clinics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, specialization, date }),
    });
    const data = await res.json();
    setClinics(data);
    setLoading(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:bg-slate-900">
      <div className="grid gap-6 md:grid-cols-4">
        <div className="space-y-2">
          <label
            htmlFor="city"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Grad
          </label>
          <Select onValueChange={setCity}>
            <SelectTrigger id="city" className="h-12">
              <SelectValue placeholder="Odaberite grad" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="specialization"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Specijalizacija
          </label>
          <Select onValueChange={setSpecialization}>
            <SelectTrigger id="specialization" className="h-12">
              <SelectValue placeholder="Odaberite specijalizaciju" />
            </SelectTrigger>
            <SelectContent>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="date"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Datum
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 w-full justify-start text-left font-normal" id="date">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Odaberite datum</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-end">
          <Button className="h-12 w-full bg-teal-500 hover:bg-teal-600" onClick={handleSearch} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Pretraga..." : "Pretraži"}
          </Button>
        </div>
      </div>
      {/* Results */}
      {clinics.length > 0 && (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {clinics.map((clinic) => (
            <div key={clinic.id} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
              <div className="font-bold text-lg mb-1">{clinic.name}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">{clinic.address}</div>
              <div className="mb-2">{clinic.description}</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {clinic.clinic_specialties?.map((spec: any) => (
                  <span key={spec.id} className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs">
                    {spec.specialty_name}
                  </span>
                ))}
              </div>
              <a href={`/clinics/${clinic.id}`} className="text-teal-600 hover:underline text-sm">Pogledaj kliniku</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}