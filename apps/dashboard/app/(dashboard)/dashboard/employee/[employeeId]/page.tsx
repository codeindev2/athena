"use client";
import BreadCrumb from "@/components/breadcrumb";
import React, { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/store/business";
import { api } from "@/lib/axios";
import { useParams } from "next/navigation";
import { EmployeeForm } from "../components/employee-form";

export default function Page() {
  const { business } = useBusiness();
  const [member, setMember] = useState();
  const { employeeId: param } = useParams();

  const fetchClients = useCallback(async () => {
    if (business.slug && param !== "new") {
      const response = await api.get(
        `business/${business.slug}/member/${param}`,
      );

      setMember(response.data.member);
    }
  }, [business, param]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const breadcrumbItems = [
    { title: "Colaborador(a)", link: "/dashboard/employee" },
    { title: "Cadastro", link: "/dashboard/employee/new" },
  ];
  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      <EmployeeForm initialData={member} title="colaborador(a)" />
    </div>
  );
}
