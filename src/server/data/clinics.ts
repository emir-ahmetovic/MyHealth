import { prisma } from "@/server/db";
import { cache } from "react";

export const getAllClinics = cache(async () => {
  return prisma.clinics.findMany({
    include: {
      clinic_specialties: true,
      reviews: true,
      clinic_gallery: true,
    },
    orderBy: { created_at: "desc" },
    // Explicitly select city and postal if needed (not required if model fields)
  });
});
