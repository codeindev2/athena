"use client";
import * as React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBusiness } from "@/store/business";
import {
  AppointmentAvailable,
  fetchAppointmentsAvailableByEmployeeId,
} from "@/functions/appointment";
import { fetchServices } from "@/functions/services";
import {
  GET_CLIENTS,
  GET_EMPLOYEES,
  GET_SERVICES,
} from "@/constants/function-name";
import { fetchEmployees } from "@/functions/employees";
import { addHours, format, parseISO, set, startOfHour } from "date-fns";
import { api } from "@/lib/axios";
import { toast } from "@/components/ui/use-toast";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import ptBR from "date-fns/locale/pt-BR";
import { useQuery } from "@tanstack/react-query";
import { fetchClients } from "@/functions/clients";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  serviceId: z.string().min(3, { message: "Serviço é obrigatório" }),
  ownerId: z.string(),
  date: z.date(),
  hour: z.string(),
  clientId: z.string(),
});

type ServiceForm = z.infer<typeof formSchema>;

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

type AppointmentFormParam = {
  initialData?: any;
  searchParams: any;
};

export function AppointmentForm({
  initialData,
  searchParams,
}: AppointmentFormParam) {
  const { business } = useBusiness();
  const [employee, setEmployee] = React.useState("");
  const [availables, setAvailables] = React.useState<AppointmentAvailable[]>(
    [],
  );

  const title = initialData ? `Editar agenda` : `Cadastro de agenda`;
  const description = initialData ? title : `Formulário de agendamento`;

  const page = Number(searchParams?.page) || 1;
  const pageLimit = Number(searchParams?.limit) || 10;
  const search = searchParams?.search ? searchParams?.search.toString() : "";

  const { data: clients } = useQuery({
    queryKey: [GET_CLIENTS, business.slug, page, pageLimit, search],
    queryFn: () =>
      fetchClients({ slug: business.slug, page, limit: pageLimit, search }),
  });

  const { data: services } = useQuery({
    queryKey: [GET_SERVICES, business.slug],
    queryFn: () => fetchServices({ slug: business.slug }),
  });

  const { data: employeeResults } = useQuery({
    queryKey: [GET_EMPLOYEES, business.slug],
    queryFn: () => fetchEmployees({ slug: business.slug }),
  });

  const employees = employeeResults?.map((employee: any) => ({
    id: employee.id,
    ownerId: employee.user.id,
    name: employee.user.name,
  }));

  const handleAppointmentAvailables = async (date: Date) => {
    const appointmentDate = startOfHour(date);

    const year = appointmentDate.getFullYear();
    const month = appointmentDate.getMonth() + 1;
    const day = appointmentDate.getDate();

    const response = await fetchAppointmentsAvailableByEmployeeId({
      userId: employee,
      year,
      month,
      day,
      slug: business.slug,
    });

    const availables = response.filter((available) => available.available);
    setAvailables(availables);
  };

  const form = useForm<ServiceForm>({
    resolver: zodResolver(formSchema),
  });

  const handleOnSubmit = async (data: ServiceForm) => {
    const createAppointmentPayload = {
      ownerId: data.ownerId,
      serviceId: data.serviceId,
      date: data.date,
      businessId: business.id,
      clientId: data.clientId,
    };

    // monta data e hora do agendamento
    const parseDate = parseISO(data?.date.toISOString());
    const formatDate = set(parseDate, {
      hours: parseInt(data.hour.split(":")[0]),
      minutes: parseInt(data.hour.split(":")[1]),
    });
    const appointmentDate = addHours(formatDate, -3);

    try {
      await api.post(`business/${business.slug}/appointment`, {
        ...createAppointmentPayload,
        date: appointmentDate,
      });
      toast({
        variant: "default",
        title: "Sucesso",
        description: "Agendamento realizado com sucesso",
        style: {
          backgroundColor: "#4BB543",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `${error?.response.data.message}`,
      });
    } finally {
    }
  };
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleOnSubmit)}
          className="space-y-2 w-full"
        >
          <div className="md:grid md:grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      value;
                    }}
                    value={field?.value}
                    defaultValue={field?.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Selecione"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.members?.data.map((client: any) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field?.value}
                    defaultValue={field?.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Selecione uma serviço"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full md:grid md:grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colaborador(a)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setEmployee(value);
                    }}
                    value={field?.value}
                    defaultValue={field?.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Selecione um colaborador(a)"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((employee: any) => (
                        <SelectItem
                          key={employee.id}
                          value={String(employee.ownerId)}
                        >
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col pt-2">
                  <FormLabel>Dia</FormLabel>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Escolha um dia</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date: any) => {
                          field.onChange(date),
                            handleAppointmentAvailables(date);
                        }}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field?.value}
                    defaultValue={field?.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Selecione um horário"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availables?.map((available) => (
                        <SelectItem key={available.hour} value={available.hour}>
                          {available.hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-1  space-x-1">
            <Button type="submit" variant="default">
              Salvar
            </Button>
            <Button variant="destructive">Cancelar</Button>
          </div>
        </form>
      </Form>
    </>
  );
}
