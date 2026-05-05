import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin } from "lucide-react"
import { getFeaturedClinics } from "@/server/data/clinic-queries"

export async function FeaturedClinics() {
  const clinics = await getFeaturedClinics();

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {clinics.map((clinic: any) => (
        <Card
          key={clinic.id}
          className="group overflow-hidden border-0 bg-white shadow-md transition-all hover:shadow-xl dark:bg-slate-900"
        >
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={clinic.clinic_gallery?.[0]?.image_url || "/placeholder.svg"}
              alt={clinic.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{clinic.name}</CardTitle>
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="ml-1 text-sm font-medium">
                  {clinic.reviews && clinic.reviews.length > 0
                    ? (
                        clinic.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) /
                        clinic.reviews.length
                      ).toFixed(1)
                    : "-"}
                </span>
              </div>
            </div>
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="mr-1 h-4 w-4" />
              {clinic.address}
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-0">
            <CardDescription className="mb-3 line-clamp-2">{clinic.description}</CardDescription>
            <div className="flex flex-wrap gap-1">
              {clinic.clinic_specialties?.map((spec: any) => (
                <Badge
                  key={spec.id}
                  variant="secondary"
                  className="bg-slate-100 text-xs font-normal text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {spec.specialty_name}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-5">
            <Link href={`/clinics/${clinic.id}`} className="w-full">
              <Button className="w-full bg-teal-500 hover:bg-teal-600">View Clinic</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}