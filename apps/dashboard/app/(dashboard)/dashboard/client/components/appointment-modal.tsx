"use client";
import { Button } from "@/components/ui/button";
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
import { Modal } from "@/components/ui/modal";
import { fetchServices } from "@/functions/services";
import { useBusiness } from "@/store/business";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addHours, format, parseISO, set, startOfHour } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchEmployees } from "@/functions/employees";
import { GET_EMPLOYEES, GET_SERVICES } from "@/constants/function-name";
import { api } from "@/lib/axios";
import { toast } from "@/components/ui/use-toast";
import ptBR from "date-fns/locale/pt-BR";
import {
  AppointmentAvailable,
  fetchAppointmentsAvailableByEmployeeId,
} from "@/functions/appointment";
import { useState } from "react";

type AppointmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  clientId: string;
};

const formSchema = z.object({
  serviceId: z.string().min(3, { message: "Serviço é obrigatório" }),
  ownerId: z.string(),
  date: z.date(),
  hour: z.string(),
});

type ServiceForm = z.infer<typeof formSchema>;

export function AppointmentModal({
  isOpen,
  onClose,
  loading,
  clientId,
}: AppointmentModalProps) {
  const { business } = useBusiness();
  const [employee, setEmployee] = useState("");
  const [availables, setAvailables] = useState<AppointmentAvailable[]>([]);
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

  const handleOnSubmit = async (data: ServiceForm) => {
    const createAppointmentPayload = {
      ownerId: data.ownerId,
      serviceId: data.serviceId,
      date: data.date,
      businessId: business.id,
      clientId,
    };

    // monta data e hora do agendamento
    const parseDate = parseISO(data.date.toISOString());
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
      onClose();
      form.reset();
    }
  };

  const form = useForm<ServiceForm>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Modal title="Agendar atendimento" isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-end w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleOnSubmit)}
            className="space-y-2 w-full"
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
                          <SelectItem
                            key={service.id}
                            value={String(service.id)}
                          >
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
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel>Dia</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] text-left font-normal",
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
                            initialFocus
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
                    <FormItem className="w-[215px]">
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
                            <SelectItem
                              key={available.hour}
                              value={available.hour}
                            >
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
            </div>
            <Button
              className="mr-1"
              disabled={loading}
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="default">
              Continuar
            </Button>
          </form>
        </Form>
      </div>
    </Modal>
  );
}
