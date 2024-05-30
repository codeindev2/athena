"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { columns } from "./components/service-tables/columns";
import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useBusiness } from "@/store/business";
import { GET_SERVICES } from "@/constants/function-name";
import { ServiceTable } from "./components/service-tables/table";
import { listServices } from "@/functions/services";

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

type Service = {
  id: string;
  name: string;
  description: string;
};

export default function page({ searchParams }: paramsProps) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const search = searchParams.search ? searchParams.search.toString() : "";
  const offset = (page - 1) * pageLimit;
  const breadcrumbItems = [{ title: "Serviços", link: "/dashboard/service" }];
  const { business } = useBusiness() as any;

  const { data: result, isLoading } = useQuery({
    queryKey: [GET_SERVICES, business.slug, page, pageLimit, search],
    queryFn: () =>
      listServices({ slug: business.slug, page, limit: pageLimit, search }),
  });

  const total = result?.services.meta.total || 0;
  const pageCount = Math.ceil(total / offset);
  const serviceData = !isLoading
    ? result.services.data.map((service: Service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
      }))
    : [];

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Serviços (${serviceData.length})`}
            description="Lista de serviço cadastrados no sistema."
          />

          <Link
            href={"/dashboard/service/new"}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Link>
        </div>
        <Separator />

        <ServiceTable
          searchKey="name"
          pageNo={page}
          columns={columns}
          totalUsers={total}
          data={serviceData}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
