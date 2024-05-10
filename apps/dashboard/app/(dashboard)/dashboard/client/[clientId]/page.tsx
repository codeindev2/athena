import BreadCrumb from "@/components/breadcrumb";
import React from "react";
import { ClientForm } from "../components/client-form";

export default function Page() {
  const breadcrumbItems = [
    { title: "Cliente", link: "/dashboard/client" },
    { title: "Cadastro", link: "/dashboard/client/new" },
  ];
  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      <ClientForm
        initialData={null}
      />
    </div>
  );
}
