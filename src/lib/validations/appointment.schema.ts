import { z } from 'zod'

export const appointmentSchema = z.object({
  clinicId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  reason: z.string().optional(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>

