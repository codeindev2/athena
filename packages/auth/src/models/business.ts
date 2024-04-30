import { z } from 'zod'

export const businessSchema = z.object({
  __typename: z.literal('Business').default('Business'),
  id: z.string(),
  ownerId: z.string(),
})

export type Business = z.infer<typeof businessSchema>
