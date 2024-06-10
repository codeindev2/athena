import { getDaysInMonth } from 'date-fns'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export const listAppointments = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/business/:slug/appointments', {
      schema: {
        tags: ['Appointments'],
        summary: 'List appointments for month by employee',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
        }),
        querystring: z.object({
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(10),
          search: z.string().optional(),
        }),
        body: z.object({
          userId: z.string(),
          year: z.number(),
          month: z.number(),
          day: z.number(),
        }),
        response: {
          200: z.object({
            appointments: z.object({
              data: z.array(
                z.object({
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
              ),
              meta: z.object({
                total: z.number(),
                page: z.number(),
                limit: z.number(),
                paginationNext: z.boolean(),
              }),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
      handler: async (request, reply) => {
        const { slug } = request.params
        const { userId, year, month, day } = request.body
        const { business } = await request.getUserMembership(slug)
        const { limit, page, search } = request.query

        // const hourStart = 8

        // const eachHourArray = Array.from(
        //   { length: 10 },
        //   (_, index) => index + hourStart,
        // )

        const numberOfDaysInMonth = getDaysInMonth(new Date(year, month - 1))
        const lastDay = numberOfDaysInMonth

        const appointmentData = await prisma.appointment.findMany({
          take: limit,
          skip: (page - 1) * limit,
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
                ownerId: userId,
              },
              {
                date: {
                  gte: new Date(`${year}-${month}-${day}`),
                  lte: new Date(`${year}-${month}-${lastDay}`),
                },
              },
              {
                service: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                client: {
                  user: {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          },
        })

        const total = await prisma.appointment.count({
          where: {
            AND: [
              {
                businessId: business.id,
              },
              {
                ownerId: userId,
              },
              {
                date: {
                  gte: new Date(`${year}-${month}-${day}`),
                  lte: new Date(`${year}-${month}-${lastDay}`),
                },
              },
              {
                service: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                client: {
                  user: {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          },
        })

        const paginationNext = total > page * limit

        const response = appointmentData.map((appointment) => {
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

        const result = {
          data: response,
          meta: {
            total,
            page,
            limit,
            paginationNext,
          },
        }
        reply.send({ appointments: result })
      },
    })
}
