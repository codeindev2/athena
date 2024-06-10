/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Overview } from "@/components/overview";
import { RecentSales } from "@/components/recent-sales";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { BusinessSelect } from "./_components/select-business";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useBusiness } from "@/store/business";
import { useQuery } from "@tanstack/react-query";
import { RecentAppoitments } from "@/components/recent-appointments";

export async function fetchBusiness() {
  const response = await api.get("/business");
  return response.data;
}

export default function page() {
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const { business, setBusiness } = useBusiness();
  const { data: session } = useSession();

  api.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${session?.user.accessToken}`;

  const { data: businessData } = useQuery({
    queryKey: ["getBusiness"],
    queryFn: () => fetchBusiness(),
  });

  if (businessData && businessData.business!.length && !business.slug) {
    setBusiness({
      id: businessData.business[0].id,
      slug: businessData.business[0].slug,
      name: businessData.business[0].name,
    });
  }

  const fetchClients = useCallback(async () => {
    if (business.slug) {
      const response = await api.get(`business/${business.slug}/members`);
      const { members } = response.data;
      const membersData = members.data.filter(
        (member: any) => member.role === "CLIENT",
      );

      setClients(membersData);

      const appointmentsResponse = await api.post(
        `business/${business.slug}/appointments`,
        {
          userId: session?.user.sub,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          day: new Date().getDate(),
        },
      );
      setAppointments(appointmentsResponse.data.appointments.data);
    }
  }, [business, session?.user.sub]);

  const appointmentsDay = appointments.map((appointment: any) => ({
    id: appointment.id,
    name: appointment.client.name,
    email: appointment.client.email,
    date: appointment.date,
    hour: appointment.hour,
  }));

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Olá ! {session?.user?.name}👋
          </h2>
          <div className="hidden md:flex items-center space-x-2">
            {/* <CalendarDateRangePicker /> */}
            <BusinessSelect />
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Agendamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointments.length ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Agendamentos do mês
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clients.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Clientes cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Produtos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Produtos cadastrados
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Serviços cadastrados
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7"> */}
            {/* <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card> */}
            <Card className="w-full col-span-4 md:col-span-3">
              <CardHeader>
                <CardTitle>Agenda</CardTitle>
                <CardDescription>Lista de tarefas para o dia</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentAppoitments appointments={appointmentsDay} />
              </CardContent>
            </Card>
            {/* </div> */}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
