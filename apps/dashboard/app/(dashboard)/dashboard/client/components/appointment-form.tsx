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
import { GET_EMPLOYEES, GET_SERVICES } from "@/constants/function-name";
import { fetchEmployees } from "@/functions/employees";
import { addHours, format, parseISO, set, startOfHour } from "date-fns";
import { api } from "@/lib/axios";
import { toast } from "@/components/ui/use-toast";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import ptBR from "date-fns/locale/pt-BR";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { on } from "events";

const formSchema = z.object({
  serviceId: z.string().min(3, { message: "Serviço é obrigatório" }),
  ownerId: z.string(),
  date: z.date(),
  hour: z.string(),
});

type ServiceForm = z.infer<typeof formSchema>;

type AppointmentFormParam = {
  className?: string;
  onClose: () => void;
  clientId: string;
};

export default function AppointmentForm({
  className,
  onClose,
  clientId,
}: AppointmentFormParam) {
  const { business } = useBusiness();
  const [employee, setEmployee] = React.useState("");
  const [availables, setAvailables] = React.useState<AppointmentAvailable[]>(
    [],
  );
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
      clientId,
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
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `${error?.response.data.message}`,
      });
    } finally {
      onClose();
      form.reset();
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleOnSubmit)}
        className={cn(className)}
      >
        <div className="space-y-2">
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
          <div className="flex flex-col">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col pt-1">
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

          <div className="flex flex-col space-y-2">
            <Button type="submit" variant="default">
              Continuar
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
