import { businessSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_error/unauthorization'

export async function shutdownBusiness(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/business/:slug',
      {
        schema: {
          tags: ['Business'],
          summary: 'Shutdown business',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { membership, business } = await request.getUserMembership(slug)

        const authBusiness = businessSchema.parse(business)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', authBusiness)) {
          throw new UnauthorizedError(
            `You're not allowed to shutdown this business.`,
          )
        }

        await prisma.business.delete({
          where: {
            id: business.id,
          },
        })

        return reply.status(204).send()
      },
    )
}
