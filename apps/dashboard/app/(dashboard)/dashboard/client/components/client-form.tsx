import { MemberForm } from "@/components/forms/member-form";

type ClientFormProps = {
  initialData: any;
};

export function ClientForm(props: ClientFormProps) {
  return <MemberForm initialData={props.initialData} title="cliente" />;
}
