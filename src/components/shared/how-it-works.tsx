import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Calendar, Bell, UserCheck } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Pronađite kliniku",
      description: "Pretražujte klinike po lokaciji, specijalizaciji ili dostupnosti",
    },
    {
      icon: Calendar,
      title: "Rezervišite termin",
      description: "Odaberite odgovarajući termin i rezervišite svoj pregled online",
    },
    {
      icon: Bell,
      title: "Primajte podsjetnike",
      description: "Primajte obavijesti i podsjetnike o svojim nadolazećim terminima",
    },
    {
      icon: UserCheck,
      title: "Posjetite kliniku",
      description: "Dođite na zakazani termin i dobijte potrebnu zdravstvenu njegu",
    },
  ]

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <Card key={index} className="border-0 bg-white shadow-md transition-all hover:shadow-lg dark:bg-slate-900">
          <CardHeader className="pb-2">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-500 dark:bg-teal-900/30">
              <step.icon className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl">{step.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{step.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}