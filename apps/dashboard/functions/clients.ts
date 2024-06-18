import { api } from "@/lib/axios";
type Params = {
    slug: string;
    page: number;
    limit: number;
    search?: string;
    };

export async function fetchClients({
    slug,
    page,
    limit,
    search,
  }: Params): Promise<any>{
    const response = await api.get(
      `business/${slug}/members?page=${page}&limit${limit}&search=${search}`,
    );
    const result = response.data;
    return result;
};