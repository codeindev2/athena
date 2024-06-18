import { api } from "@/lib/axios";

export type AppointmentAvailable = {
   hour: string;
   available: boolean;
}

type QueryParams = {
    slug: string;
    page: number;
    limit: number;
    search?: string;
    };

export type AppointmentParams = {
    userId: string;
    year: number;
    month: number;
    day: number;
    slug: string;
}
export async function fetchAppointmentsAvailableByEmployeeId({
    userId,
    year,
    month,
    day,
    slug,
}: AppointmentParams): Promise<AppointmentAvailable[]> {
    const response  = await api.post(`business/${slug}/appointments/available`, {
            userId,
            year,
            month,
            day,
    });

    return response.data?.appointments as AppointmentAvailable[];   
}

export async function listAppointments({
    slug,
    page,
    limit,
    search,
}: QueryParams): Promise<any> {
    const response = await api.get(
        `business/${slug}/appointments?page=${page}&limit${limit}&search=${search}`,
      );
      const result = response.data as any; 

    return result;
}

export async function getAppointment({
    slug,
    appointmentId,
}: any): Promise<any> {
    const response = await api.get(
        `business/${slug}/appointment/${appointmentId}`,
      );
      const result = response.data?.appointment; 

    return result;
}