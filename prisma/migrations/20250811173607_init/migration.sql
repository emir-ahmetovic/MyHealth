-- CreateTable
CREATE TABLE "public"."admin_logs" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "target_user_id" INTEGER,
    "timestamp" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "duration_minutes" INTEGER DEFAULT 30,
    "price" DECIMAL(10,2),

    CONSTRAINT "appointment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointments" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "doctor_id" INTEGER,
    "appointment_type_id" INTEGER,
    "appointment_time" TIMESTAMP(6) NOT NULL,
    "duration_minutes" INTEGER DEFAULT 30,
    "price" DECIMAL(10,2),
    "status" VARCHAR(20) DEFAULT 'scheduled',
    "notes" TEXT,
    "cancelled_reason" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clinic_contacts" (
    "id" SERIAL NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "contact_type" VARCHAR(50) NOT NULL,
    "contact_value" VARCHAR(200) NOT NULL,
    "is_primary" BOOLEAN DEFAULT false,
    "label" VARCHAR(50),

    CONSTRAINT "clinic_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clinic_gallery" (
    "id" SERIAL NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_title" VARCHAR(100),
    "image_description" TEXT,
    "display_order" INTEGER DEFAULT 0,
    "is_primary" BOOLEAN DEFAULT false,
    "uploaded_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clinic_hours" (
    "id" SERIAL NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "open_time" TIME(6) NOT NULL,
    "close_time" TIME(6) NOT NULL,
    "is_closed" BOOLEAN DEFAULT false,

    CONSTRAINT "clinic_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clinic_specialties" (
    "id" SERIAL NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "specialty_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clinic_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "clinic_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clinics" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "clinic_type_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "website" VARCHAR(200),
    "description" TEXT,
    "working_hours" TEXT,
    "is_featured" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctor_availability_exceptions" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "is_available" BOOLEAN DEFAULT false,
    "reason" TEXT,

    CONSTRAINT "doctor_availability_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctor_schedule" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,

    CONSTRAINT "doctor_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctors" (
    "id" SERIAL NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "specialization" VARCHAR(100),
    "license_number" VARCHAR(50),
    "education" TEXT,
    "experience_years" INTEGER,
    "consultation_fee" DECIMAL(10,2),
    "bio" TEXT,
    "available" BOOLEAN DEFAULT true,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_records" (
    "id" SERIAL NOT NULL,
    "appointment_id" INTEGER NOT NULL,
    "diagnosis" TEXT,
    "prescription" TEXT,
    "notes" TEXT,
    "attachments" TEXT[],
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email_notifications" BOOLEAN DEFAULT true,
    "sms_notifications" BOOLEAN DEFAULT false,
    "reminder_hours_before" INTEGER DEFAULT 24,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" VARCHAR(50),
    "scheduled_for" TIMESTAMP(6),
    "sent_at" TIMESTAMP(6),
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "emergency_contact" VARCHAR(100),
    "emergency_phone" VARCHAR(20),
    "insurance_info" TEXT,
    "medical_history" TEXT,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "clinic_id" INTEGER,
    "doctor_id" INTEGER,
    "rating" INTEGER,
    "comment" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."time_slots" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "is_available" BOOLEAN DEFAULT true,
    "appointment_id" INTEGER,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "phone" VARCHAR(20),
    "date_of_birth" DATE,
    "gender" VARCHAR(10),
    "is_active" BOOLEAN DEFAULT true,
    "last_login" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_appointments_clinic" ON "public"."appointments"("clinic_id");

-- CreateIndex
CREATE INDEX "idx_appointments_datetime" ON "public"."appointments"("appointment_time");

-- CreateIndex
CREATE INDEX "idx_appointments_doctor" ON "public"."appointments"("doctor_id");

-- CreateIndex
CREATE INDEX "idx_appointments_patient" ON "public"."appointments"("patient_id");

-- CreateIndex
CREATE INDEX "idx_appointments_status" ON "public"."appointments"("status");

-- CreateIndex
CREATE INDEX "idx_clinic_contacts_clinic" ON "public"."clinic_contacts"("clinic_id");

-- CreateIndex
CREATE INDEX "idx_clinic_contacts_type" ON "public"."clinic_contacts"("contact_type");

-- CreateIndex
CREATE INDEX "idx_clinic_gallery_clinic" ON "public"."clinic_gallery"("clinic_id");

-- CreateIndex
CREATE INDEX "idx_clinic_gallery_primary" ON "public"."clinic_gallery"("is_primary");

-- CreateIndex
CREATE INDEX "idx_clinic_hours_clinic" ON "public"."clinic_hours"("clinic_id");

-- CreateIndex
CREATE INDEX "idx_clinic_specialties_clinic" ON "public"."clinic_specialties"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_types_name_key" ON "public"."clinic_types"("name");

-- CreateIndex
CREATE INDEX "idx_clinics_type" ON "public"."clinics"("clinic_type_id");

-- CreateIndex
CREATE INDEX "idx_doctor_schedule_day" ON "public"."doctor_schedule"("day_of_week");

-- CreateIndex
CREATE INDEX "idx_doctor_schedule_doctor" ON "public"."doctor_schedule"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_license_number_key" ON "public"."doctors"("license_number");

-- CreateIndex
CREATE INDEX "idx_doctors_available" ON "public"."doctors"("available");

-- CreateIndex
CREATE INDEX "idx_doctors_clinic" ON "public"."doctors"("clinic_id");

-- CreateIndex
CREATE INDEX "idx_doctors_specialization" ON "public"."doctors"("specialization");

-- CreateIndex
CREATE INDEX "idx_medical_records_appointment" ON "public"."medical_records"("appointment_id");

-- CreateIndex
CREATE INDEX "idx_notification_preferences_user" ON "public"."notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_read" ON "public"."notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "public"."notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_patient_profiles_user" ON "public"."patient_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_reviews_clinic" ON "public"."reviews"("clinic_id");

-- CreateIndex
CREATE INDEX "idx_reviews_doctor" ON "public"."reviews"("doctor_id");

-- CreateIndex
CREATE INDEX "idx_time_slots_available" ON "public"."time_slots"("is_available");

-- CreateIndex
CREATE INDEX "idx_time_slots_date" ON "public"."time_slots"("date");

-- CreateIndex
CREATE INDEX "idx_time_slots_doctor" ON "public"."time_slots"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_users_active" ON "public"."users"("is_active");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "public"."users"("role");

-- AddForeignKey
ALTER TABLE "public"."admin_logs" ADD CONSTRAINT "admin_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_appointment_type_id_fkey" FOREIGN KEY ("appointment_type_id") REFERENCES "public"."appointment_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."clinic_contacts" ADD CONSTRAINT "clinic_contacts_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."clinic_gallery" ADD CONSTRAINT "clinic_gallery_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."clinic_hours" ADD CONSTRAINT "clinic_hours_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."clinic_specialties" ADD CONSTRAINT "clinic_specialties_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."clinics" ADD CONSTRAINT "clinics_clinic_type_id_fkey" FOREIGN KEY ("clinic_type_id") REFERENCES "public"."clinic_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."clinics" ADD CONSTRAINT "clinics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."doctor_availability_exceptions" ADD CONSTRAINT "doctor_availability_exceptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."doctor_schedule" ADD CONSTRAINT "doctor_schedule_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."doctors" ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."patient_profiles" ADD CONSTRAINT "patient_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."time_slots" ADD CONSTRAINT "time_slots_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."time_slots" ADD CONSTRAINT "time_slots_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
