import { parseISO, startOfHour } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { ConflictError } from '../_error/conflict'
import { NotFoundError } from '../_error/not-found'
import { BadRequestError } from '../_error/bad-request'

export const createScheduleSchema = z.object({
  clientId: z.string(),
  serviceId: z.string(),
  ownerId: z.string(),
  businessId: z.string(),
  date: z.string(),
})

export const createSchedule = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/business/:slug/schedule', {
      schema: {
        tags: ['Schedules'],
        summary: 'Create a schedule',
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

        // TODO: Verificar se a empresa existe
        const business = await prisma.business.findUnique({
          where: { id: businessId },
        })

        // convert data para hora
        const appointmentDate = startOfHour(parseISO(date))
        // Separa a hora
        const appointmentHour = appointmentDate.getHours()

        if(appointmentHour >= 18){
          throw new BadRequestError('Não é possível agendar após as 18h')
        }
        // Verificar se ja tem agendamento no mesmo horario e mesmo dia para o mesmo dono
        const appointment = await prisma.schedule.findFirst({
          where: { date: appointmentDate, ownerId, businessId },
        })
        if (appointment) {
          throw new ConflictError('Já existe um agendamento neste horário')
        }
        
        if (!business) {
          throw new NotFoundError('Empresa não encontrada')
        }
        // TODO: Verificar se o cliente existe
        const client = await prisma.member.findUnique({
          where: { id: clientId, businessId },
        })

        if (!client) {
          throw new NotFoundError('Cliente não encontrado')
        }
        // TODO: Verificar se o serviço existe
        const service = await prisma.service.findUnique({
          where: { id: serviceId, businessId },
        })

        if (!service) {
          throw new NotFoundError('Serviço não encontrado')
        }
        // TODO: Verificar se o proprietário existe
        const owner = await prisma.user.findUnique({
          where: { id: ownerId },
        })

        if (!owner) {
          throw new NotFoundError('Proprietário não encontrado')
        }

        await prisma.schedule.create({
          data: {
            clientId,
            serviceId,
            ownerId,
            businessId,
            date: appointmentDate,
          },
        })
        reply.send({ message: 'Agendamento criado com sucesso' })
      },
    })
}
