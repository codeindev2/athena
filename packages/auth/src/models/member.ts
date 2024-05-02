import { z } from 'zod'

export const memberSchema = z.object({
  __typename: z.literal('Member').default('Member'),
  id: z.string(),
  userId: z.string(),
  businessId: z.string(),
})

export type Member = z.infer<typeof memberSchema>
