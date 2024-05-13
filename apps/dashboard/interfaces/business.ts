import { z } from "zod";

const businessSchema = z.object({
    slug: z.string(),
    name: z.string(),
});

export type Business = z.infer<typeof businessSchema>;