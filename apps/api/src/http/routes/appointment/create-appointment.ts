import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'

import { createScheduleSchema } from './schema/appointment'
import { createAppointmentUseCase } from './use-cases/create-appointment.usecase'

export const createAppointment = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/business/:slug/appointment', {
      schema: {
        tags: ['Appointments'],
        summary: 'Create a appointment',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
        }),
        body: createScheduleSchema,
        response: {
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
      handler: async (req, reply) => {
        const { clientId, serviceId, ownerId, businessId, date } = req.body
        await createAppointmentUseCase({
          clientId,
          serviceId,
          ownerId,
          businessId,
          date,
        })
        reply.send({ message: 'Agendamento criado com sucesso' })
      },
    })
}
