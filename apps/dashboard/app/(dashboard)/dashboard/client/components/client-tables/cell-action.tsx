"use client";
import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/axios";
import { useBusiness } from "@/store/business";
import { CalendarDaysIcon, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

interface CellActionProps {
  data: any;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { business } = useBusiness();
  const onConfirm = async () => {
    try {
      setLoading(true);
      if (!data.id) throw new Error("Cliente não encontrado");
      await api.delete(`business/${business.slug}/member/${data.id}`);
      toast({
        variant: "default",
        title: "Sucesso",
        description: "Excluído com sucesso",
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
        description: "Falha ao excutar exclusão",
      });
    } finally {
      setLoading(false);
      setOpen(false);
      router.refresh();
      // if (typeof window !== "undefined") {
      //   window.location.reload();
      // }
      router.prefetch("/dashboard/client");
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <CalendarDaysIcon className="mr-2 h-4 w-4" /> Agendar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/client/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Atualizar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
