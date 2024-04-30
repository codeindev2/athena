import { roleSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function getBusinessAll(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/business',
      {
        schema: {
          tags: ['Business'],
          summary: 'Get business where user is a member',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              business: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  slug: z.string(),
                  avatarUrl: z.string().url().nullable(),
                  role: roleSchema,
                }),
              ),
            }),
          },
        },
      },
      async (request) => {
        const userId = await request.getCurrentUserId()

        const business = await prisma.business.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            members: {
              select: {
                role: true,
              },
              where: {
                userId,
              },
            },
          },
          where: {
            members: {
              some: {
                userId,
              },
            },
          },
        })

        const businessWithUserRole = business.map(({ members, ...org }) => {
          return {
            ...org,
            role: members[0].role,
          }
        })

        return { business: businessWithUserRole }
      },
    )
}
