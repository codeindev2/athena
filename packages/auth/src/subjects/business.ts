import { z } from 'zod'

import { businessSchema } from '../models/business'

export const businessSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('delete'),
    z.literal('update'),
    z.literal('transfer_ownership'),
  ]),
  z.union([z.literal('Business'), businessSchema]),
])

export type BusinessSubject = z.infer<typeof businessSubject>
