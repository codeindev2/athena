import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { listAppointmentsUseCase } from './use-cases/list-appointments.usecase'
import { getDaysInMonth, parseISO } from 'date-fns'

export const listAppointments = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/business/:slug/appointments', {
      schema: {
        tags: ['Appointments'],
        summary: 'List appointments',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
        }),
        body: z.object({
          user_id: z.string(),
          year: z.number(),
          month: z.number(),
          day: z.number(),
        }),
        response: {
          200: z.object({
            appointments: z.array(
              z.object({
              id: z.string(),
              date: z.string(),
              hour: z.string(),
              client: z.object({
                id: z.string(),
                name: z.string(),
              }),
              service: z.object({
                id: z.string(),
                name: z.string(),
              }),
              employee: z.object({
                id: z.string(),
                name: z.string(),
              }),
            })
          )
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
      handler: async (request, reply) => {
        const { slug } = request.params
        const { user_id, year, month, day } = request.body
        const { business,  } = await request.getUserMembership(slug)

        const hourStart = 8;

        const eachHourArray = Array.from(
          { length: 10 },
          (_, index) => index + hourStart,
        );

        const numberOfDaysInMonth = getDaysInMonth(new Date(year, month - 1));
        const lastDay = numberOfDaysInMonth

        const appointments = await listAppointmentsUseCase({ user_id, year, month, startDay: day, lastDay, businessId: business.id})

        const response = appointments.map(appointment => {
          const date = new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(appointment.date)

          const hour = new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(appointment.date)
    
          return {
            id: appointment.id,
            date,
            hour,
            client: {
              id: appointment.client.id,
              name: appointment.client.user.name,
            },
            service: {
              id: appointment.service.id,
              name: appointment.service.name,
            },
            employee: {
              id: appointment.owner.id,
              name: appointment.owner.name,
            },
          }
        })
        reply.send({ appointments: response, })
      },
    })
}
