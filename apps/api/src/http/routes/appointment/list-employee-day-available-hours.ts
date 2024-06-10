/* eslint-disable @typescript-eslint/no-explicit-any */
import { getHours, isAfter } from 'date-fns'
import { format } from 'date-fns-tz'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'

import { listEmployeeAvailableHoursUseCase } from './use-cases/list-employee-day-available-hours.usecase'

export const listEmployeeAvailableHours = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/business/:slug/appointments/available', {
      schema: {
        tags: ['Appointments'],
        summary: 'List appointments avaliable for a day',
        security: [{ bearerAuth: [] }],
        params: z.object({
          slug: z.string(),
        }),
        body: z.object({
          userId: z.string(),
          year: z.number(),
          month: z.number(),
          day: z.number(),
        }),
        response: {
          200: z.object({
            appointments: z.array(
              z.object({
                hour: z.string(),
                available: z.boolean(),
              }),
            ),
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

        const hourStart = business.startWorkHour

        const eachHourArray = Array.from(
          { length: 10 },
          (_, index) => index + hourStart,
        )

        const currentDate = new Date(Date.now())

        const appointments = await listEmployeeAvailableHoursUseCase({
          userId,
          year,
          month,
          startDay: day,
          businessId: business.id,
        })

        const availability = eachHourArray.map((hour) => {
          const hasAppointmentInHour = appointments.find((appointment: any) => {
            const addedDate = appointment.date
            return getHours(addedDate) === hour
          })

          const compareDate = new Date(year, month - 1, day, hour)

          return {
            hour: format(compareDate, 'HH:mm'),
            available:
              !hasAppointmentInHour && isAfter(compareDate, currentDate),
          }
        })

        reply.send({
          appointments: availability,
        })
      },
    })
}
