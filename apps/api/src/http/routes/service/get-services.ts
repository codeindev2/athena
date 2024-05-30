import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_error/unauthorization'

export async function getServices(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/business/:slug/services',
      {
        schema: {
          tags: ['Services'],
          summary: 'Get all business services',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          querystring: z.object({
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(10),
            search: z.string().optional(),
          }),
          response: {
            200: z.object({
              services: z.object({
                data: z.array(
                  z.object({
                    id: z.string().uuid(),
                    description: z.string(),
                    name: z.string(),
                    businessId: z.string().uuid(),
                    business: z.object({
                      id: z.string().uuid(),
                      name: z.string().nullable(),
                      avatarUrl: z.string().nullable(),
                    }),
                  }),
                ),
                meta: z.object({
                  page: z.number(),
                  limit: z.number(),
                  total: z.number(),
                  paginationNext: z.boolean(),
                }),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { limit, page, search } = request.query
        const userId = await request.getCurrentUserId()
        const { business, membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Service')) {
          throw new UnauthorizedError(
            `You're not allowed to see business services.`,
          )
        }

        const services = await prisma.service.findMany({
          take: limit,
          skip: (page - 1) * limit,
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
            businessId: business.id,
            AND: {
              name: {
                contains: search,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        })

        const total = await prisma.service.count({
          where: {
            businessId: business.id,
          },
        })

        const paginationNext = total > page * limit

        const response = {
          data: services,
          meta: {
            page,
            limit,
            total,
            paginationNext,
          },
        }

        return reply.send({ services: response })
      },
    )
}
