import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ClientTable } from "./components/client-tables/table";
import { api } from "@/lib/axios";
import { getServerSession } from "next-auth";
import { columns } from "./components/client-tables/columns";

const breadcrumbItems = [{ title: "Clientes", link: "/dashboard/client" }];

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export default async function page({ searchParams }: paramsProps) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const search = searchParams.search ? searchParams.search.toString() : ''  
  const offset = (page - 1) * pageLimit;
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYjIxOWM0NS1jNDQxLTQzYTEtOWExMS04YTRmMmJmZjE0MGUiLCJpYXQiOjE3MTUxODA1MTEsImV4cCI6MTcxNTc4NTMxMX0.0jiHVeOlckG5ACPNRtmb85eniiyURS_0U5PKi4J65Qg"


  const res = await api.get(`business/marieju/members?page=${page}&limit${offset}&search=${search}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  const members =  res.data.members;
  const totalUsers = members.meta.total; //1000
  const pageCount = Math.ceil(totalUsers / offset);
  const clientes: any[] = members.data.map((member: any) => ({
      id: member.id,
      name: member.user.name,
      email: member.user.email,
      phone: member.user.phone,
    }
  ));


  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Clientes (${members.data.length})`}
            description="Lista de clientes cadastrados no sistema."
          />

          <Link
            href={"/dashboard/client/new"}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Link>
        </div>
        <Separator />

        <ClientTable
          searchKey="name"
          pageNo={page}
          columns={columns}
          totalUsers={totalUsers}
          data={clientes}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
