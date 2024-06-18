"use client";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { AppointmentTable } from "./components/table/table";
import { columns } from "./components/table/columns";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GET_APPOINTMENTS } from "@/constants/function-name";
import { useBusiness } from "@/store/business";
import { useQuery } from "@tanstack/react-query";
import { listAppointments } from "@/functions/appointment";
import { format } from "date-fns";
import { formatTime } from "@/utils/format-hour";
import Link from "next/link";

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};
export default function page({ searchParams }: paramsProps) {
  const breadcrumbItems = [
    { title: "Agendamentos", link: "/dashboard/appointment" },
  ];

  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const search = searchParams.search ? searchParams.search.toString() : "";
  const { business } = useBusiness();

  const { data: response, isLoading } = useQuery({
    queryKey: [GET_APPOINTMENTS, business.slug, page, pageLimit, search],
    queryFn: () =>
      listAppointments({ slug: business.slug, page, limit: pageLimit, search }),
  });

  const total = response?.appointments.meta.total || 0;

  const appointments = !isLoading
    ? response.appointments.data.map((appointment: any) => ({
        id: appointment.id,
        name: appointment.client.name,
        hour: formatTime(appointment.hour), // TODO: format hour to HH:mm format
        date: appointment.date,
      }))
    : [];

  const pageCount = Math.ceil(total / pageLimit);

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title={`Agendamentos`} description="Lista de agendamentos" />

          <Link
            href={"/dashboard/appointment/new"}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Link>
        </div>

        <Separator />

        <AppointmentTable
          searchKey="name"
          pageNo={page}
          columns={columns}
          totalUsers={total}
          data={appointments}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
