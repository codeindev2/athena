import { z } from 'zod'

export const productSchema = z.object({
  __typename: z.literal('Product').default('Product'),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  businessId: z.string(),
})

export type Product = z.infer<typeof productSchema>
