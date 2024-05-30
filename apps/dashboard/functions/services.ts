import { api } from "@/lib/axios";

type Params = {
    slug: string;
    page?: number;
    limit?: number;
    search?: string;
};

export interface Services {
  id: string
  description: string
  name: string
}
export async function fetchServices({ slug }: Params): Promise<Services[]> {
  const response = await api.get(`business/${slug}/services`);
  const result = response.data.services.data as Services[];
  return result;
}


export async function listServices({ slug, page, limit,search }: Params){
const response = await api.get(`business/${slug}/services?page=${page}&limit${limit}&search=${search}`);
const result = response.data;
return result;
}