-- DropForeignKey
ALTER TABLE "public"."medical_records" DROP CONSTRAINT "medical_records_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."time_slots" DROP CONSTRAINT "time_slots_appointment_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."time_slots" ADD CONSTRAINT "time_slots_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
