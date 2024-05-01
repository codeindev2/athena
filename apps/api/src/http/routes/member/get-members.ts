import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/business/:slug/members',
      {
        schema: {
          tags: ['Members'],
          summary: 'Get members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  id: z.string().uuid(),
                  role: z.string().nullable(),
                  user: z.object({
                    id: z.string().uuid(),
                    name: z.string().nullable(),
                    email: z.string(),
                    phone: z.string().nullable(),
                    address: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  }),
                  business: z.object({
                    id: z.string().uuid(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  }),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { business, membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Member')) {
          throw new UnauthorizedError(`You're not allowed to see this member.`)
        }

        const members = await prisma.member.findMany({
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                avatarUrl: true,
              },
            },
            business: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            businessId: business.id,
          },
        })

        if (!members) {
          throw new BadRequestError('Member not found.')
        }

        return reply.send({ members })
      },
    )
}
