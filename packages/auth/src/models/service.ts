import { z } from 'zod'

export const serviceSchema = z.object({
  __typename: z.literal('Service').default('Service'),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  businessId: z.string(),
})

export type Service = z.infer<typeof serviceSchema>
