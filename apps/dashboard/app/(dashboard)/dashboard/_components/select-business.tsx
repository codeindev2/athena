/* eslint-disable no-console */
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/store/business";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { Business } from "@/interfaces/business";
import { createSlug } from "@/utils/create-slug";
const formSchema = z.object({
  slug: z.string(),
});
export function BusinessSelect() {
  const { business, setBusiness} = useBusiness();
  const [companies, setCompanies] = useState<Business[]>([]);
  const { data: session } = useSession();
         
  api.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${session?.user.accessToken}`;
  const getBusiness = useCallback(async () => {
    try {
      const response = await api.get("/business");
      setCompanies(response.data.business);
    } catch (error) {
      console.error(error);
    }
  }, []);

  function handleSelectChange(name: string) {
    const slug = createSlug(name);
    setBusiness({
      slug,
      name,
    });
  }

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    getBusiness();
    form.setValue('slug', business.name);
  }, [getBusiness, form, business]);


  return (
    <Form {...form}>
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(name) => handleSelectChange(name)}
                value={field?.value}
                defaultValue={field?.value}
              >
                <FormControl >
                  <SelectTrigger onChange={() => console.log(field)}>
                    <SelectValue
                      defaultValue={field.value}
                      placeholder="Selecione uma empresa"
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.slug} value={String(company.name)} >
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
    </Form>
  );
}
