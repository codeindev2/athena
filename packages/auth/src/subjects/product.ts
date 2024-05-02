import { z } from 'zod'

import { productSchema } from '..'

export const productSubject = z.tuple([
  z.union([
    z.literal('delete'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('manage'),
  ]),
  z.union([z.literal('Product'), productSchema]),
])

export type ProductSubject = z.infer<typeof productSubject>
