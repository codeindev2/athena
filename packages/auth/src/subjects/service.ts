import { z } from 'zod'

import { serviceSchema } from '../models/service'

export const serviceSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('get'),
    z.literal('delete'),
    z.literal('update'),
  ]),
  z.union([z.literal('Service'), serviceSchema]),
])

export type ServiceSubject = z.infer<typeof serviceSubject>
