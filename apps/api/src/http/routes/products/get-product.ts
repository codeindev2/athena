import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function getProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:orgSlug/product/:productSlug',
      {
        schema: {
          tags: ['Products'],
          summary: 'Get product details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string(),
            productSlug: z.string().uuid(),
          }),
          response: {
            200: z.object({
              product: z.object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string(),
                organizationId: z.string().uuid(),
                organization: z.object({
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
        const { orgSlug, productSlug } = request.params
        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(orgSlug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Product')) {
          throw new UnauthorizedError(
            `You're not allowed to see this projects.`,
          )
        }

        const product = await prisma.product.findUnique({
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            organizationId: true,
            organization: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            id: productSlug,
            organizationId: organization.id,
          },
        })

        if (!product) {
          throw new BadRequestError('Product not found.')
        }

        return reply.send({ product })
      },
    )
}
