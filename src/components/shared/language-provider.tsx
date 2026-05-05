"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "bs" | "sr" | "hr" | "en"

type Translations = {
  [key: string]: {
    [key in Language]: string
  }
}

const translations: Translations = {
  "nav.home": {
    bs: "Početna",
    sr: "Почетна",
    hr: "Početna",
    en: "Home",
  },
  "nav.clinics": {
    bs: "Klinike",
    sr: "Клинике",
    hr: "Klinike",
    en: "Clinics",
  },
  "nav.appointments": {
    bs: "Termini",
    sr: "Термини",
    hr: "Termini",
    en: "Appointments",
  },
  "nav.login": {
    bs: "Prijava",
    sr: "Пријава",
    hr: "Prijava",
    en: "Login",
  },
  "nav.register": {
    bs: "Registracija",
    sr: "Регистрација",
    hr: "Registracija",
    en: "Register",
  },
  // Add more translations as needed
}

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("bs")

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language]
    }
    return key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider")
  }
  return context
}