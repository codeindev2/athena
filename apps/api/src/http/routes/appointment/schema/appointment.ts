import z from 'zod'

export const createScheduleSchema = z.object({
  clientId: z.string(),
  serviceId: z.string(),
  ownerId: z.string(),
  businessId: z.string(),
  date: z.string(),
})

export type CreateAppointmentDTO = z.infer<typeof createScheduleSchema>

export interface Service {
  id: string
  name: string
  description: string
  businessId: string
}

export interface User {
  name: string
  email: string
}

export interface Owner {
  id: string
  name: string
}
export interface Client {
  id: string
  user: User
}
export interface Appointment {
  id: string
  date: Date
  service: Service
  client: Client
  owner: Owner
}
