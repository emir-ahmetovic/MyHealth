-- AlterTable
ALTER TABLE "public"."clinics" ADD COLUMN     "city" TEXT,
ADD COLUMN     "license" TEXT,
ADD COLUMN     "postal" TEXT,
ADD COLUMN     "specializations" TEXT[];
