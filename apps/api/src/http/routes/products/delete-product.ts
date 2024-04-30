import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function deleteProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/business/:slug/product/:productId',
      {
        schema: {
          tags: ['Products'],
          summary: 'Delete a product',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            productId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, productId } = request.params
        const userId = await request.getCurrentUserId()
        const { business, membership } = await request.getUserMembership(slug)

        const product = await prisma.product.findUnique({
          where: {
            id: productId,
            businessId: business.id,
          },
        })

        if (!product) {
          throw new BadRequestError('Product not found.')
        }

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', 'Product')) {
          throw new UnauthorizedError(
            `You're not allowed to delete this product.`,
          )
        }

        await prisma.product.delete({
          where: {
            id: productId,
          },
        })

        return reply.status(204).send()
      },
    )
}
