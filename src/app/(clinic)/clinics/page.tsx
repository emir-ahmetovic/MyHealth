"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Star, MapPin, Filter } from "lucide-react"
// import removed: getAllClinics is now server-side only

// Define types to match your Prisma schema exactly
interface Review {
  id: number;
  patient_id: number;
  clinic_id: number | null;
  doctor_id: number | null;
  rating: number | null;
  comment: string | null;
  created_at: Date | null;
}

interface ClinicSpecialty {
  id: number;
  clinic_id: number;
  specialty_name: string;
  created_at: Date | null;
}

interface ClinicGallery {
  id: number;
  clinic_id: number;
  image_url: string;
  image_title: string | null;
  image_description: string | null;
  display_order: number | null;
  is_primary: boolean | null;
  uploaded_at: Date | null;
}

interface Clinic {
  id: number;
  user_id: number;
  clinic_type_id: number;
  name: string;
  address: string;
  city?: string;
  postal?: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  working_hours: string | null;
  is_featured: boolean | null;
  created_at: Date | null;
  reviews: Review[];
  clinic_specialties: ClinicSpecialty[];
  clinic_gallery: ClinicGallery[];
}

export default function ClinicsPage() {
  // All hooks at top level, always called in same order
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageIndexes, setImageIndexes] = useState<{[clinicId: number]: number}>({});

  useEffect(() => {
    async function loadClinics() {
      try {
        const res = await fetch("/api/clinics");
        if (!res.ok) throw new Error("Neuspješno učitavanje klinika");
        const data = await res.json();
        setClinics(data.clinics || []);
      } catch (error) {
        console.error("Neuspješno učitavanje klinika:", error);
      } finally {
        setLoading(false);
      }
    }
    loadClinics();
  }, []);

  useEffect(() => {
    if (clinics.length > 0) {
      setImageIndexes(prev => {
        // Only add missing clinic ids, never reset existing
        const updated = { ...prev };
        clinics.forEach(clinic => {
          if (typeof updated[clinic.id] !== "number") {
            updated[clinic.id] = 0;
          }
        });
        return updated;
      });
    }
  }, [clinics]);

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

  const filteredClinics = clinics.filter(clinic => {
    const matchesSearch = searchTerm === "" || 
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (clinic.description && clinic.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCity = selectedCity === "" || selectedCity === "all" || 
      clinic.address.includes(selectedCity);

    const matchesSpecialization = selectedSpecialization === "" || selectedSpecialization === "all" ||
      clinic.clinic_specialties.some(spec => 
        spec.specialty_name.toLowerCase().includes(selectedSpecialization.toLowerCase())
      );

    return matchesSearch && matchesCity && matchesSpecialization;
  });

  const handlePrevImage = (clinicId: number, imagesLength: number) => {
    setImageIndexes(prev => {
      const current = typeof prev[clinicId] === "number" ? prev[clinicId] : 0;
      return {
        ...prev,
        [clinicId]: current > 0 ? current - 1 : imagesLength - 1
      };
    });
  };
  const handleNextImage = (clinicId: number, imagesLength: number) => {
    setImageIndexes(prev => {
      const current = typeof prev[clinicId] === "number" ? prev[clinicId] : 0;
      return {
        ...prev,
        [clinicId]: current < imagesLength - 1 ? current + 1 : 0
      };
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Zdravstvene klinike
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Pronađite i rezervišite termine u privatnim klinikama širom Bosne i Hercegovine
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pretraži klinike</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Naziv klinike ili usluga..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Grad</label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Odaberite grad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi gradovi</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Specijalizacija</label>
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Odaberite specijalizaciju" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve specijalizacije</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              className="h-12 w-full bg-teal-500 hover:bg-teal-600"
              onClick={() => {
                // Reset filters
                setSearchTerm("")
                setSelectedCity("")
                setSelectedSpecialization("")
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Resetuj filtere
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-slate-600 dark:text-slate-400">Pronađeno {filteredClinics.length} klinika</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Sortiraj po:</span>
          <Select defaultValue="rating">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Ocjena</SelectItem>
              <SelectItem value="name">Naziv</SelectItem>
              <SelectItem value="location">Lokacija</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clinics Grid */}
      {filteredClinics.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
              Nijedna klinika ne odgovara vašim kriterijima pretrage
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Pokušajte promijeniti filtere pretrage</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClinics.map((clinic) => (
            <Card
              key={clinic.id}
              className="group overflow-hidden border-0 bg-white shadow-md transition-all hover:shadow-xl dark:bg-slate-900"
            >
              <div className="aspect-video w-full overflow-hidden relative">
                {/* Image carousel for card background */}
                {clinic.clinic_gallery && clinic.clinic_gallery.length > 0 ? (
                  <>
                    <img
                      src={clinic.clinic_gallery[
                        typeof imageIndexes[clinic.id] === "number" ? imageIndexes[clinic.id] : 0
                      ]?.image_url || "/placeholder.svg"}
                      alt={clinic.clinic_gallery[
                        typeof imageIndexes[clinic.id] === "number" ? imageIndexes[clinic.id] : 0
                      ]?.image_title || clinic.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {clinic.clinic_gallery.length > 1 && (
                      <>
                        <button
                          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white/80 rounded-full p-2 shadow z-10 cursor-pointer transition-opacity"
                          onClick={e => { e.stopPropagation(); handlePrevImage(clinic.id, clinic.clinic_gallery.length); }}
                          type="button"
                          tabIndex={0}
                          aria-label="Prethodna slika"
                        >
                          {'<'}
                        </button>
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white/80 rounded-full p-2 shadow z-10 cursor-pointer transition-opacity"
                          onClick={e => { e.stopPropagation(); handleNextImage(clinic.id, clinic.clinic_gallery.length); }}
                          type="button"
                          tabIndex={0}
                          aria-label="Sljedeća slika"
                        >
                          {'>'}
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <img
                    src="/placeholder.svg"
                    alt={clinic.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <CardHeader className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{clinic.name}</CardTitle>
                      {clinic.is_featured && (
                        <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                          Istaknuto
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <MapPin className="mr-1 h-4 w-4" />
                        {clinic.address}
                        {clinic.city && `, ${clinic.city}`}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="ml-1 text-sm font-medium">
                          {clinic.reviews && clinic.reviews.length > 0
                            ? (
                                clinic.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / clinic.reviews.length
                              ).toFixed(1)
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-0">
                <CardDescription className="mb-3 line-clamp-2">{clinic.description}</CardDescription>
                <div className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {clinic.address}
                    {clinic.city && `, ${clinic.city}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {clinic.clinic_specialties.slice(0, 2).map((spec) => (
                    <Badge
                      key={spec.id}
                      variant="secondary"
                      className="bg-slate-100 text-xs font-normal text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {spec.specialty_name}
                    </Badge>
                  ))}
                  {clinic.clinic_specialties.length > 2 && (
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-xs font-normal text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      +{clinic.clinic_specialties.length - 2} još
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-5">
                <Link href={`/clinics/${clinic.id}`} className="w-full">
                  <Button className="w-full bg-teal-500 hover:bg-teal-600">Pogledaj kliniku</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}