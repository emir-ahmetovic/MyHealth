import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Unesite ispravnu email adresu'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera'),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Ime mora imati najmanje 2 karaktera'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

