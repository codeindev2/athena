import { z } from "zod";

const businessSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
});

export type Business = z.infer<typeof businessSchema>;