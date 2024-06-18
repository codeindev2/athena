"use client";
import BreadCrumb from "@/components/breadcrumb";
import React, { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/store/business";
import { api } from "@/lib/axios";
import { useParams } from "next/navigation";
import { ServiceForm } from "../components/service-form";

export default function Page() {
  const { business } = useBusiness();
  const [service, setService] = useState();
  const { serviceId: param } = useParams();

  const getServices = useCallback(async () => {
    if (business.slug && param !== "new") {
      const response = await api.get(
        `business/${business.slug}/service/${param}`,
      );

      setService(response.data.service);
    }
  }, [business, param]);

  useEffect(() => {
    getServices();
  }, [getServices]);

  const breadcrumbItems = [
    { title: "Serviço", link: "/dashboard/service" },
    { title: "Cadastro", link: "/dashboard/service/new" },
  ];
  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      <ServiceForm initialData={service} title="serviço" />
    </div>
  );
}
