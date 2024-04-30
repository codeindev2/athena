// import { productSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function updateProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/business/:slug/product/:productId',
      {
        schema: {
          tags: ['Products'],
          summary: 'Update a product',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            description: z.string(),
            price: z.coerce.number(),
          }),
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
        // const authProject = productSchema.parse(product)

        if (cannot('update', 'Product')) {
          throw new UnauthorizedError(
            `You're not allowed to update this project.`,
          )
        }

        const { name, description, price } = request.body

        await prisma.product.update({
          where: {
            id: productId,
          },
          data: {
            name,
            description,
            price,
          },
        })

        return reply.status(204).send()
      },
    )
}
