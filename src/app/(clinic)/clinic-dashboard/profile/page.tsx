"use client"

import { ClinicSidebar } from "@/components/layout/clinic-sidebar";
import ClinicProfilePage from "../_components/profile";
import ClinicGallerySection from "../_components/gallery";

export default function ProfileDashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <ClinicSidebar />
      <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-900">
        <ClinicProfilePage />
        {/* Gallery/photo upload only shown in add/edit form, not here */}
      </main>
    </div>
  );
}
