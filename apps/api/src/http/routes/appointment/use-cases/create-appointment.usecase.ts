import { prisma } from "@/lib/prisma";
import { NotFoundError } from "../../_error/not-found";
import { CreateAppointmentDTO } from "../schema/appointment";
import { parseISO, startOfHour } from "date-fns";
import { BadRequestError } from "../../_error/bad-request";
import { ConflictError } from "../../_error/conflict";

export const createAppointmentUseCase = async (data: CreateAppointmentDTO): Promise<void> => {
    const { clientId, serviceId, ownerId, businessId, date } = data
    // TODO: Verificar se a empresa existe
       const business = await prisma.business.findUnique({
        where: { id: businessId },
      })

      if(!business){  
        throw new NotFoundError('Empresa não encontrada')
      }

      // convert data para hora
      const appointmentDate = startOfHour(parseISO(date))
      // Separa a hora
      const appointmentHour = appointmentDate.getHours()
      // Verificar se o horario é antes do horario de inicio
      if(appointmentHour < business.startWorkHour || appointmentHour >= business.endWorkHour){
        throw new BadRequestError(`Não é possível agendar neste horário`)
      }

      // Verificar se ja tem agendamento no mesmo horario e mesmo dia para o mesmo dono
      const appointment = await prisma.appointment.findFirst({
        where: { date: appointmentDate, ownerId, businessId },
      })

      if (appointment) {
        throw new ConflictError('Já existe um agendamento neste horário, tente outro horário')
      }

      if (!business) {
        throw new NotFoundError('Estabelecimento não encontrado')
      }
      // TODO: Verificar se o cliente existe
      const client = await prisma.member.findUnique({
        where: { id: clientId, businessId },
      })

      if (!client) {
        throw new NotFoundError('Você não é um cliente deste estabelecimento')
      }
      // TODO: Verificar se o serviço existe
      const service = await prisma.service.findUnique({
        where: { id: serviceId, businessId },
      })

      if (!service) {
        throw new NotFoundError('Serviço não encontrado')
      }
      // TODO: Verificar se o proprietário existe
      const employee = await prisma.user.findUnique({
        where: { id: ownerId },
      })

      if (!employee) {
        throw new NotFoundError('Funcionário não encontrado')
      }

      await prisma.appointment.create({
        data: {
          clientId,
          serviceId,
          ownerId,
          businessId,
          date: appointmentDate,
        },
      })
};