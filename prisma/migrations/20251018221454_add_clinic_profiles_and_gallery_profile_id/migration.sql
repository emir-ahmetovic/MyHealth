/*
  Warnings:

  - Added the required column `profile_id` to the `clinic_gallery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."clinic_gallery" ADD COLUMN     "profile_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."clinic_profiles" (
    "id" SERIAL NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "bio" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_clinic_profiles_clinic" ON "public"."clinic_profiles"("clinic_id");

-- CreateIndex
CREATE INDEX "idx_clinic_gallery_profile" ON "public"."clinic_gallery"("profile_id");

-- AddForeignKey
ALTER TABLE "public"."clinic_profiles" ADD CONSTRAINT "clinic_profiles_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."clinic_gallery" ADD CONSTRAINT "clinic_gallery_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."clinic_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
