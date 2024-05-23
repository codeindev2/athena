import { id } from "date-fns/locale";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const businessSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
});

export type BusinessData = z.infer<typeof businessSchema>;

type BusinessStore = {
    business: BusinessData
    setBusiness: (bussiness: BusinessData) => void;
}

export const useBusiness = create<BusinessStore>()(
    persist(
      (set) => ({
        business: {
          id: "",
          slug: "",
          name: "",
        },
        setBusiness: (business: BusinessData) => set(() => ({ business })),
      }
    ),
    { name: "business-store",  skipHydration: false },
  ),
);
