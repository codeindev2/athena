import { api } from "@/lib/axios";
type Params = {
    slug: string;
    page?: number;
    limit?: number;
    search?: string;
    };

export async function fetchEmployees({
    slug,
    page = 1,
    limit = 100,
    search="",
  }: Params){
    const response = await api.get(
      `business/${slug}/members?page=${page}&limit${limit}&search=${search}&role=EMPLOYEE`,
    );
    const result = response?.data?.members?.data;
    return result;
};


export async function listProducts({
  slug,
  page = 1,
  limit = 100,
  search="",
}: Params){
  const response = await api.get(
    `business/${slug}/products?page=${page}&limit${limit}&search=${search}`,
  );
  const result = response?.data
  return result;
};