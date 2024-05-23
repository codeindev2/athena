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
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "../ui/use-toast";
import { api } from "@/lib/axios";
import { useBusiness } from "@/store/business";
import Link from "next/link";
const formSchema = z.object({
  name: z.string().min(3, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Por favor entre co email válido" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface MemberFormProps {
  initialData?: any | null;
  title: string;
}

export const MemberForm: React.FC<MemberFormProps> = ({
  initialData,
  title: initialTitle,
}) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const title = initialData
    ? `Editar ${initialTitle}`
    : `Cadastro de ${initialTitle}`;
  const description = initialData
    ? `Editar ${initialTitle}`
    : `Adicionar novo ${initialTitle}`;
  const action = initialData ? "Atualizar" : "Salvar";
  const { business } = useBusiness();

  const defaultValues = {
    name: "",
    email: "",
    phone: "",
    address: "",
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.user.name,
        email: initialData.user.email,
        phone: initialData.user.phone,
        address: initialData.user.address,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await api.patch(
          `/business/${business.slug}/member/${initialData.id}`,
          data,
        );
        toast({
          title: "Atualização.",
          description: "Cliente atualizado com sucesso.",
          style: {
            backgroundColor: "#4BB543",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      } else {
        await api.post(`/business/${business.slug}/member`, data);
        toast({
          title: "Cadastro.",
          description: "Cliente cadastrado com sucesso.",
          style: {
            backgroundColor: "#4BB543",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      }
      router.refresh();
      router.push(`/dashboard/client`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        <Link href={"/dashboard/client"} className="flex ">
          <ArrowLeft />
          Voltar
        </Link>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 w-full"
        >
          <div className="md:grid md:grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex align-items justify-end">
            <Button className="mb-2" type="submit">
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
