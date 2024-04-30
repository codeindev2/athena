import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function getService(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/business/:slug/service/:serviceId',
      {
        schema: {
          tags: ['Services'],
          summary: 'Get service details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            serviceId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              service: z.object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string(),
                businessId: z.string().uuid(),
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
        const { slug, serviceId } = request.params
        const userId = await request.getCurrentUserId()
        const { business, membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Service')) {
          throw new UnauthorizedError(
            `You're not allowed to see this projects.`,
          )
        }

        const service = await prisma.service.findUnique({
          select: {
            id: true,
            name: true,
            description: true,
            businessId: true,
            business: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            id: serviceId,
            businessId: business.id,
          },
        })

        if (!service) {
          throw new BadRequestError('Service not found.')
        }

        return reply.send({ service })
      },
    )
}
