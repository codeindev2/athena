import { roleSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/business/:slug/members',
      {
        schema: {
          tags: ['Members'],
          summary: 'Get members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          querystring: z.object({
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(10),
            search: z.string().optional(),
            role: roleSchema.optional().default('CLIENT'),
          }),
          response: {
            200: z.object({
              members: z.object({
                data: z.array(
                  z.object({
                    id: z.string().uuid(),
                    role: z.string().nullable(),
                    user: z.object({
                      id: z.string().uuid(),
                      name: z.string().nullable(),
                      email: z.string(),
                      phone: z.string().nullable(),
                      address: z.string().nullable(),
                      avatarUrl: z.string().nullable(),
                    }),
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

        if (cannot('get', 'Member')) {
          throw new UnauthorizedError(`You're not allowed to see this member.`)
        }
        const members = await prisma.member.findMany({
          take: limit,
          skip: (page - 1) * limit,
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                avatarUrl: true,
              },
            },
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
            OR: [
              {
                user: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                user: {
                  email: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
          orderBy: {
            user: {
              name: 'asc',
            },
          },
        })

        if (!members) {
          throw new BadRequestError('Member not found.')
        }

        const total = await prisma.member.count({
          where: {
            businessId: business.id,
            AND: [
              {
                user: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                user: {
                  email: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        })

        // Essa parte é responsável por verificar se ainda existem mais registros para serem paginados
        // Se o total de registros for maior que a página atual vezes a quantidade de registros por página
        // exemplo: 100 > 10 * 10 = 100 a resposta será true mas se for 100 > 10 * 20 = 200 a resposta será false
        const paginationNext = total > page * limit

        const response = {
          data: members,
          meta: {
            page,
            limit,
            total,
            paginationNext,
          },
        }
        return reply.send({ members: response })
      },
    )
}
