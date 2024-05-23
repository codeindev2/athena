import { api } from "@/lib/axios";

export type AppointmentAvailable = {
   hour: string;
   available: boolean;
}

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