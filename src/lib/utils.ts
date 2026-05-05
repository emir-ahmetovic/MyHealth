import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalize appointment objects returned from various APIs
export function normalizeAppointment(a: any) {
  if (!a) return a;
  const doctor = a.doctor ?? a.doctors ?? (a.doctors ? a.doctors : null);
  const clinic = a.clinics ?? a.clinic ?? a.clinic_id ? { id: a.clinic_id } : null;
  return { ...a, doctor, clinic };
}