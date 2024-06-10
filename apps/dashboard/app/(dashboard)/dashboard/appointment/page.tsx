import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { AppointmentTable } from "./components/table/table";
import { columns } from "./components/table/columns";

export default function page() {
  const breadcrumbItems = [
    { title: "Agendamentos", link: "/dashboard/appointment" },
  ];

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title={`Agendamentos`} description="Lista de agendamentos" />
        </div>

        <Separator />

        <AppointmentTable
          searchKey="name"
          pageNo={1}
          columns={columns}
          totalUsers={1}
          data={[]}
          pageCount={1}
        />
      </div>
    </>
  );
}
