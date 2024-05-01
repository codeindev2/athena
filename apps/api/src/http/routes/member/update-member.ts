import { roleSchema } from '@saas/auth'
import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_error/unauthorization'

export async function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/business/:slug/member/:memberId',
      {
        schema: {
          tags: ['Members'],
          summary: 'Update a member',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            role: roleSchema.optional(),
            phone: z.string().nullish(),
            address: z.string().nullish(),
            password: z.string().nullish(),
            image: z.string().url().nullish(),
          }),
          params: z.object({
            slug: z.string(),
            memberId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params
        // Inicia verificação de permisses
        const userId = await request.getCurrentUserId()
        const { business, membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Member')) {
          throw new UnauthorizedError(
            `You're not allowed to create new members.`,
          )
        }
        // Fim da verificação de permisses

        const { name, email, role, phone, address, password, image } =
          request.body

        const passwordHash = password ? await hash(password, 6) : undefined

        await prisma.member.update({
          data: {
            role: role ?? 'CLIENT',
            business: {
              connect: {
                id: business.id,
              },
            },
            user: {
              update: {
                name,
                email,
                address: address ?? undefined,
                phone: phone ?? undefined,
                passwordHash,
                avatarUrl: image ?? undefined,
              },
            },
          },
          where: {
            id: memberId,
          },
        })

        return reply.status(201).send()
      },
    )
}
