import { prisma } from "@/server/db";
import { cache } from "react";

export const getFeaturedClinics = cache(async () => {
  return prisma.clinics.findMany({
    where: { is_featured: true },
    include: {
      doctors: true,
      clinic_specialties: true,
      reviews: true,
    },
    take: 8,
    orderBy: { created_at: "desc" },
  });
});

export const searchClinics = cache(async (filters: {
  city?: string;
  specialization?: string;
  date?: Date;
}) => {
  return prisma.clinics.findMany({
    where: {
      ...(filters.city && { address: { contains: filters.city, mode: "insensitive" } }),
      ...(filters.specialization && {
        clinic_specialties: {
          some: { specialty_name: { contains: filters.specialization, mode: "insensitive" } },
        },
      }),
    },
    include: {
      doctors: true,
      clinic_specialties: true,
      reviews: true,
    },
    orderBy: { created_at: "desc" },
  });
});
