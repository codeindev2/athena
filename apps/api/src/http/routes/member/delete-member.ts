import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function deleteMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/business/:slug/member/:memberId',
      {
        schema: {
          tags: ['Members'],
          summary: 'Delete a member',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            memberId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params
        const userId = await request.getCurrentUserId()
        const { business, membership } = await request.getUserMembership(slug)

        const member = await prisma.member.findUnique({
          where: {
            id: memberId,
            businessId: business.id,
          },
        })

        if (!member) {
          throw new BadRequestError('Member not found.')
        }

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', 'Member')) {
          throw new UnauthorizedError(
            `You're not allowed to delete this member.`,
          )
        }

        await prisma.member.delete({
          where: {
            id: memberId,
          },
        })

        return reply.status(204).send()
      },
    )
}
