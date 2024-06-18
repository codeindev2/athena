"use client";
import BreadCrumb from "@/components/breadcrumb";
import React, { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/store/business";
import { api } from "@/lib/axios";
import { useParams } from "next/navigation";
import { AppointmentForm } from "./form";
type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export default function Page({ searchParams }: paramsProps) {
  const { business } = useBusiness();
  const [member, setMember] = useState();
  const { appointmentId: param } = useParams();

  const fetchClients = useCallback(async () => {
    if (business.slug && param !== "new" && !param) {
      const response = await api.get(
        `business/${business.slug}/appointment/${param}`,
      );

      setMember(response.data.member);
    }
  }, [business, param]);
  2;

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const breadcrumbItems = [
    { title: "Agendamentos", link: "/dashboard/appointment" },
    { title: "Cadastro", link: "/dashboard/appointment/new" },
  ];
  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      <AppointmentForm initialData={member} searchParams={searchParams} />
    </div>
  );
}
