import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function updateService(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/business/:slug/service/:serviceId',
      {
        schema: {
          tags: ['Services'],
          summary: 'Update a service',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            description: z.string(),
          }),
          params: z.object({
            slug: z.string(),
            serviceId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, serviceId } = request.params
        const userId = await request.getCurrentUserId()
        const { business, membership } = await request.getUserMembership(slug)

        const product = await prisma.product.findUnique({
          where: {
            id: serviceId,
            businessId: business.id,
          },
        })

        if (!product) {
          throw new BadRequestError('Service not found.')
        }

        const { cannot } = getUserPermissions(userId, membership.role)
        // const authProject = productSchema.parse(product)

        if (cannot('update', 'Service')) {
          throw new UnauthorizedError(
            `You're not allowed to update this service.`,
          )
        }

        const { name, description } = request.body

        await prisma.product.update({
          where: {
            id: serviceId,
          },
          data: {
            name,
            description,
          },
        })

        return reply.status(204).send()
      },
    )
}
