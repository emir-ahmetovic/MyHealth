"use client"

import { ClinicSidebar } from "@/components/layout/clinic-sidebar";
import ClinicDoctorsPage from "../_components/doctors";

export default function DoctorsDashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <ClinicSidebar />
      <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-900">
        <ClinicDoctorsPage />
      </main>
    </div>
  );
}
