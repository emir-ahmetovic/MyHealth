/*
  Warnings:

  - Made the column `doctor_id` on table `time_slots` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."time_slots" ALTER COLUMN "doctor_id" SET NOT NULL;
