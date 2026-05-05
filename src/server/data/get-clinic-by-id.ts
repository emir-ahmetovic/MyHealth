import { prisma } from "@/server/db";
import { cache } from "react";

export const getClinicById = cache(async (id: number) => {
  return prisma.clinics.findUnique({
    where: { id },
    include: {
      doctors: true,
      clinic_specialties: true,
      reviews: true,
      clinic_gallery: true,
    },
  });
});
