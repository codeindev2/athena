import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_error/unauthorization'

export async function createService(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/business/:slug/service',
      {
        schema: {
          tags: ['Services'],
          summary: 'Create a new service',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            description: z.string(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              serviceId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        // Inicia verificação de permissões
        const userId = await request.getCurrentUserId()
        const { business, membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Service')) {
          throw new UnauthorizedError(
            `You're not allowed to create new products.`,
          )
        }
        // Fim da verificação de permisses

        const { name, description } = request.body

        const product = await prisma.service.create({
          data: {
            name,
            description,
            businessId: business.id,
          },
        })

        return reply.status(201).send({
          serviceId: product.id,
        })
      },
    )
}
