/*
  Warnings:

  - You are about to drop the column `profile_id` on the `clinic_gallery` table. All the data in the column will be lost.
  - You are about to drop the `clinic_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."clinic_gallery" DROP CONSTRAINT "clinic_gallery_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."clinic_profiles" DROP CONSTRAINT "clinic_profiles_clinic_id_fkey";

-- DropIndex
DROP INDEX "public"."idx_clinic_gallery_profile";

-- AlterTable
ALTER TABLE "public"."clinic_gallery" DROP COLUMN "profile_id";

-- DropTable
DROP TABLE "public"."clinic_profiles";
