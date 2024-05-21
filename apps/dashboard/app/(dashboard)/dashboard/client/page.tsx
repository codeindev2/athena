"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { ClientTable } from "./components/client-tables/table";
import { columns } from "./components/client-tables/columns";
import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useBusiness } from "@/store/business";
import { GET_CLIENTS } from "@/constants/function-name";
import { fetchClients } from "@/functions/clients";

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

type Member = {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
};

export default function page({ searchParams }: paramsProps) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const search = searchParams.search ? searchParams.search.toString() : "";
  const offset = (page - 1) * pageLimit;
  const breadcrumbItems = [{ title: "Clientes", link: "/dashboard/client" }];
  const { business } = useBusiness() as any;

  const { data: clients, isLoading } = useQuery({
    queryKey: [GET_CLIENTS, business.slug, page, pageLimit, search],
    queryFn: () =>
      fetchClients({ slug: business.slug, page, limit: pageLimit, search }),
  });

  const total = clients?.members?.meta.total || 0;
  const pageCount = Math.ceil(total / offset);
  const clientes = !isLoading
    ? clients.members.data.map((member: Member) => ({
        id: member.id,
        name: member.user.name,
        email: member.user.email,
        phone: member.user.phone,
      }))
    : [];

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Clientes (${clientes.length})`}
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
          totalUsers={total}
          data={clientes}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
