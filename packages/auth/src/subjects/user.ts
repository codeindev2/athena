import { z } from 'zod'

import { userSchema } from '..'

export const userSubject = z.tuple([
  z.union([
    z.literal('delete'),
    z.literal('get'),
    z.literal('update'),
    z.literal('manage'),
  ]),
  z.union([z.literal('User'), userSchema]),
])

export type UserSubject = z.infer<typeof userSubject>
