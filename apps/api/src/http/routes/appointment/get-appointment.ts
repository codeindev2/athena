import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export const getAppointment = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/business/:slug/appointment/:appointmentId', {
      schema: {
        tags: ['Appointments'],
        summary: 'Get appointment by id',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
          appointmentId: z.string(),
        }),
        querystring: z.object({
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(10),
          search: z.string().optional(),
        }),
        response: {
          200: z.object({
            appointment: z.object({
              id: z.string(),
              date: z.string(),
              hour: z.string(),
              client: z.object({
                id: z.string().nullable(),
                name: z.string().nullable(),
              }),
              service: z.object({
                id: z.string(),
                name: z.string(),
              }),
              employee: z.object({
                id: z.string(),
                name: z.string().nullable(),
              }),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
      handler: async (request, reply) => {
        const { slug, appointmentId } = request.params
        const { business } = await request.getUserMembership(slug)

        const appointment = await prisma.appointment.findFirst({
          select: {
            id: true,
            date: true,
            service: true,
            client: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          where: {
            AND: [
              {
                businessId: business.id,
              },
              {
                id: appointmentId,
              },
            ],
          },
          orderBy: [
            {
              date: 'desc',
            },
          ],
        })

        if (!appointment) {
          reply.status(404).send({ message: 'Appointment not found' })
          return
        }

        const date = new Intl.DateTimeFormat('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(appointment.date)

        const hour = new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(appointment.date)

        const response = {
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

        reply.send({ appointment: response })
      },
    })
}
