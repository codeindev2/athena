import { z } from 'zod'

import { memberSchema } from '../models/member'

export const memberSubject = z.tuple([
  z.union([
    z.literal('delete'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('manage'),
  ]),
  z.literal('Member', memberSchema),
])

export type MemberSubject = z.infer<typeof memberSubject>
