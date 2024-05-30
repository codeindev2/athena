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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "@/lib/axios";
import { useBusiness } from "@/store/business";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
const formSchema = z.object({
  name: z.string().min(3, { message: "Nome é obrigatório" }),
  description: z.string().optional(),
  price: z.number().optional(),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MemberFormProps {
  initialData?: any | null;
  title: string;
}

export const ProductForm: React.FC<MemberFormProps> = ({
  initialData,
  title: initialTitle,
}) => {
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await api.patch(
          `/business/${business.slug}/product
        /${initialData.id}`,
          {
            ...data,
          },
        );
        toast({
          title: "Atualização.",
          description: "Produto atualizado com sucesso.",
          style: {
            backgroundColor: "#4BB543",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      } else {
        await api.post(`/business/${business.slug}/product`, {
          ...data,
        });
        toast({
          title: "Cadastro.",
          description: "Produto cadastrado com sucesso.",
          style: {
            backgroundColor: "#4BB543",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      }
      router.refresh();
      router.push(`/dashboard/product`);
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
        <Link href={"/dashboard/product"} className="flex ">
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
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
