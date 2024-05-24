import { prisma } from '@/lib/prisma'

import { Appointment } from '../schema/appointment'
type ListAppointmentsDTO = {
  userId: string
  year: number
  month: number
  startDay: number
  lastDay: number
  businessId: string
}
export const listAppointmentsUseCase = async ({
  userId,
  year,
  month,
  startDay,
  lastDay,
  businessId,
}: ListAppointmentsDTO): Promise<Appointment[]> => {
  const parsedMonth = String(month).padStart(2, '0')

  const appointments = await prisma.appointment.findMany({
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
          businessId,
        },
        {
          ownerId: userId,
        },
        {
          date: {
            gte: new Date(`${year}-${parsedMonth}-${startDay}`),
            lte: new Date(`${year}-${parsedMonth}-${lastDay}`),
          },
        },
      ],
    },
  })

  return appointments as Appointment[]
}
