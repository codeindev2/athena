"use client";

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
import { authOptions } from "@/lib/auth-options";
import { use, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useBusiness } from "@/store/business";

const breadcrumbItems = [{ title: "Clientes", link: "/dashboard/client" }];

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export default function page({ searchParams }: paramsProps) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const search = searchParams.search ? searchParams.search.toString() : "";
  const offset = (page - 1) * pageLimit;
  const [clients, setClients] = useState<any[]>([]);
  const { business } = useBusiness();

  const fetchClients = useCallback(async () => {
    if (business.slug) {
      const response = await api.get(
        `business/${business.slug}/members?page=${page}&limit${offset}&search=${search}`,
      );
      const { members } = response.data;
      const membersData = members.data.filter(
        (member: any) => member.role === "CLIENT",
      );
      console.log("membersData", membersData);
      setClients(membersData);
    }
  }, [business]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const members: any = clients.length ? clients : [];
  const totalUsers = clients.length; //1000
  const pageCount = Math.ceil(totalUsers / offset);
  const clientes: any[] = clients.length
    ? members?.map((member: any) => ({
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
          totalUsers={totalUsers}
          data={clientes}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
