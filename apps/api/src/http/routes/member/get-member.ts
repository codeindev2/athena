import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function getMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/business/:slug/member/:memberId',
      {
        schema: {
          tags: ['Members'],
          summary: 'Get member details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            memberId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              member: z.object({
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
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params
        const userId = await request.getCurrentUserId()
        const { business, membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Member')) {
          throw new UnauthorizedError(`You're not allowed to see this member.`)
        }

        const member = await prisma.member.findUnique({
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
            id: memberId,
            businessId: business.id,
          },
        })

        if (!member) {
          throw new BadRequestError('Member not found.')
        }

        return reply.send({ member })
      },
    )
}
