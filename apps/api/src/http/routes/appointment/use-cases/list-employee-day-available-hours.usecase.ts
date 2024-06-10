import { prisma } from '@/lib/prisma'

import { Appointment } from '../schema/appointment'
type ListAppointmentsDTO = {
  userId: string
  year: number
  month: number
  startDay: number
  businessId: string
}
export const listEmployeeAvailableHoursUseCase = async ({
  userId,
  year,
  month,
  startDay,
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
            gt: new Date(`${year}-${parsedMonth}-${startDay}`),
          },
        },
      ],
    },
  })

  return appointments as Appointment[]
}
