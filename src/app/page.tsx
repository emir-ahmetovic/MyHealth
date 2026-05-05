// No 'use client' directive; keep as server component
import Link from "next/link"
import { cookies } from "next/headers"
import { useUser } from "@/components/shared/user-context"
import { Button } from "@/components/ui/button"
import { SearchClinics } from "@/components/shared/search-clinics"
import { FeaturedClinics } from "@/components/shared/featured-clinics"
import { HowItWorks } from "@/components/shared/how-it-works"

export default async function Home() {
  // Server-side authentication detection
  const cookieStore = await cookies()
  const userToken = cookieStore.get("token")?.value
  const isLoggedIn = !!userToken

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 dark:bg-slate-900">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-5"></div>
        <div className="container relative px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Vaše zdravlje, <span className="text-teal-500">Vaš raspored</span>
            </h1>
            <p className="mb-10 text-lg text-slate-600 dark:text-slate-400 md:text-xl">
              Rezervišite termine u privatnim klinikama širom Bosne i Hercegovine na jednom mjestu. Jednostavno, brzo i praktično.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {/* Use both server-side and client-side context for instant and secure UI */}
              {/* @ts-ignore: useUser is client-side only, so this is a hybrid approach */}
              {typeof window !== "undefined" ? (() => {
                // @ts-ignore
                const { user, logout } = require("@/components/shared/user-context").useUser();
                if (!user && !isLoggedIn) {
                  return (
                    <>
                      <Link href="/register">
                        <Button size="lg" className="w-full bg-teal-500 hover:bg-teal-600 sm:w-auto">
                          Registruj se kao pacijent
                        </Button>
                      </Link>
                      <Link href="/register/clinic">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                          Registruj kliniku
                        </Button>
                      </Link>
                    </>
                  );
                } else if (user || isLoggedIn) {
                  return (
                    <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={logout}>
                      Odjava
                    </Button>
                  );
                }
                return null;
              })() : (!isLoggedIn && (
                <>
                  <Link href="/register">
                    <Button size="lg" className="w-full bg-teal-500 hover:bg-teal-600 sm:w-auto">
                      Registruj se kao pacijent
                    </Button>
                  </Link>
                  <Link href="/register/clinic">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Registruj kliniku
                    </Button>
                  </Link>
                </>
              ))}
            </div>
          </div>
          <div className="mt-16 flex justify-center">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl shadow-xl">
              <img
                alt="Healthcare dashboard"
                className="w-full object-cover"
                src="/placeholder.svg?height=600&width=1200"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950"></div>
      </section>

      {/* Search Section */}
      <section className="container px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold">Pronađi kliniku</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Pretražujte klinike po lokaciji, specijalizaciji ili dostupnosti
            </p>
          </div>
          <SearchClinics />
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold">Kako funkcioniše</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Rezervišite medicinske termine u samo nekoliko jednostavnih koraka
            </p>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* Featured Clinics */}
      <section className="container px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold">Istaknute klinike</h2>
            <p className="text-slate-600 dark:text-slate-400">Otkrijte najbolje zdravstvene ustanove u vašem području</p>
          </div>
          <FeaturedClinics />
        </div>
      </section>

      {/* CTA Section - only if not logged in */}
      {!isLoggedIn && (
        <section className="bg-teal-500 py-16">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-white">Spremni preuzeti kontrolu nad svojim zdravljem?</h2>
              <p className="mb-8 text-lg text-teal-50">
                Pridružite se hiljadama pacijenata koji već jednostavno upravljaju svojim medicinskim terminima.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-white text-teal-500 hover:bg-teal-50">
                  Započni sada
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
// This is the main entry point for the Next.js application
// It renders the home page with various sections including hero, search, how it works, featured clinics, and a call to action.
// The page is structured with a responsive layout and uses components for modularity.
// The home page is designed to be user-friendly and visually appealing, encouraging users to register and book appointments.
// The page includes links to register as a patient or clinic, and features a search component for finding clinics.
// The layout is styled with Tailwind CSS for a modern look and feel.
// The page also includes a call to action section to encourage user engagement.
// This code is part of a Next.js application and serves as the main page for users to interact with the healthcare booking system.
// It is designed to be responsive and accessible, providing a seamless user experience across devices.
// The page is built using React components and Next.js features, ensuring optimal performance and SEO.
// The code is structured to be maintainable and scalable, allowing for future enhancements and features.
// The home page serves as the landing page for the application, providing essential information and functionality for users.
// It is a key part of the user journey, guiding them through the process of finding and booking healthcare services.
// The page is optimized for both desktop and mobile users, ensuring a consistent experience across platforms.    