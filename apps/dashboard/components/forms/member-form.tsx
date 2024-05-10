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
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "../ui/use-toast";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome é obrigatório" }),
  email: z
    .string()
    .email({ message: "Por favor entre co email válido" }),
  phone: z.string().optional(),
  address: z.string().optional()

});

type ProductFormValues = z.infer<typeof formSchema>;

interface MemberFormProps {
  initialData?: any | null;
  title: string, 
}

export const MemberForm: React.FC<MemberFormProps> = ({
  initialData,
  title: initialTitle
}) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const title = initialData ? `Editar ${initialTitle}` : `Cadastro de ${initialTitle}`;
  const description = initialData ? `Editar ${initialTitle}` : `Adicionar novo ${initialTitle}`;
  const action = initialData ? "Atualizar" : "Salvar";
  const session = useSession();

  const token = session.data?.user.token

  const defaultValues = initialData
    ? initialData
    : {
        name: "",
        email: "",
        phone: "",
        address: "",
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductFormValues) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      setLoading(true);
      if (initialData) {
        await api.patch(`/business/marieju/member/${initialData._id}`, data);
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
        await api.post(`/business/marieju/member`, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
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

  const onDelete = async () => {
    try {
      setLoading(true);
      //   await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      {...field}
                    />
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
                    <Input
                      disabled={loading}
                      {...field}
                    />
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
                    <Input  disabled={loading} {...field} />
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
                    <Input
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
         
          <Button  className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
