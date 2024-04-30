import { businessSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function updateBusiness(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/business/:slug',
      {
        schema: {
          tags: ['Business'],
          summary: 'Update business details',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
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

        const { name, domain, shouldAttachUsersByDomain } = request.body

        // Para pegar os dados da organização
        const authBusiness = businessSchema.parse(business)

        // Verifica se o usuário pode editar a organização
        const { cannot } = getUserPermissions(userId, membership.role)

        // Se o usuário não puder editar a organização, lança um erro
        if (cannot('update', authBusiness)) {
          throw new UnauthorizedError(
            `You're not allowed to update this business.`,
          )
        }

        if (domain) {
          const businessByDomain = await prisma.business.findFirst({
            where: {
              domain,
              id: {
                not: business.id,
              },
            },
          })

          if (businessByDomain) {
            throw new BadRequestError(
              'Another business with same domain already exists.',
            )
          }
        }

        await prisma.business.update({
          where: {
            id: business.id,
          },
          data: {
            name,
            domain,
            shouldAttachUsersByDomain,
          },
        })

        return reply.status(204).send()
      },
    )
}
