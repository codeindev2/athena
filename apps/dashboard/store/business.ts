import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const businessSchema = z.object({
    slug: z.string(),
    name: z.string(),
});

type BusinessData = z.infer<typeof businessSchema>;

type BusinessStore = {
    business: BusinessData
    setBusiness: (bussiness: BusinessData) => void;
}

export const useBusiness = create<BusinessStore>()(
    persist(
      (set) => ({
        business: {
          slug: "",
          name: "",
        },
        setBusiness: (business: BusinessData) => set(() => ({ business })),
      }
    ),
    { name: "business-store",  skipHydration: false },
  ),
);
