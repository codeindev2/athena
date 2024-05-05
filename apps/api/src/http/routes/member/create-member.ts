import { roleSchema } from '@saas/auth'
import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_error/unauthorization'

export async function createMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/business/:slug/member',
      {
        schema: {
          tags: ['Members'],
          summary: 'Create a new member',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            email: z.string().email(),
            role: roleSchema.nullish(),
            phone: z.string().nullish(),
            address: z.string().nullish(),
            password: z.string().nullish(),
            image: z.string().url().nullish(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              memberId: z.string().uuid(),
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

        if (cannot('create', 'Member')) {
          throw new UnauthorizedError(
            `You're not allowed to create new members.`,
          )
        }
        // Fim da verificação de permisses

        const { name, email, role, phone, address, password, image } =
          request.body

        const passwordHash = password ? await hash(password, 6) : undefined

        const member = await prisma.member.create({
          data: {
            role: role ?? 'CLIENT',
            business: {
              connect: {
                id: business.id,
              },
            },
            user: {
              create: {
                name,
                email,
                address: address ?? undefined,
                phone: phone ?? undefined,
                passwordHash,
                avatarUrl: image ?? undefined,
              },
            },
          },
        })

        return reply.status(201).send({
          memberId: member.id,
        })
      },
    )
}
