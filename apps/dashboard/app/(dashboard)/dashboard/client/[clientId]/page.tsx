"use client";
import BreadCrumb from "@/components/breadcrumb";
import React, { useCallback, useEffect, useState } from "react";
import { ClientForm } from "../components/client-form";
import { useBusiness } from "@/store/business";
import { api } from "@/lib/axios";
import { useParams } from "next/navigation";

export default function Page() {
  const { business } = useBusiness();
  const [client, setClient] = useState();
  const { clientId: param } = useParams();

  const fetchClients = useCallback(async () => {
    if (business.slug && param !== "new") {
      const response = await api.get(
        `business/${business.slug}/member/${param}`,
      );

      setClient(response.data.member);
    }
  }, [business, param]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const breadcrumbItems = [
    { title: "Cliente", link: "/dashboard/client" },
    { title: "Cadastro", link: "/dashboard/client/new" },
  ];
  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      <ClientForm initialData={client} />
    </div>
  );
}
