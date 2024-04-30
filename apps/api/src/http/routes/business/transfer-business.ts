import { businessSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_error/bad-request'
import { UnauthorizedError } from '../_error/unauthorization'

export async function transferBusiness(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/business/:slug/owner',
      {
        schema: {
          tags: ['Business'],
          summary: 'Transfer business ownership',
          security: [{ bearerAuth: [] }],
          body: z.object({
            transferToUserId: z.string().uuid(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { membership, business } = await request.getUserMembership(slug)

        const authBusiness = businessSchema.parse(business)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('transfer_ownership', authBusiness)) {
          throw new UnauthorizedError(
            `You're not allowed to transfer this business ownership.`,
          )
        }

        const { transferToUserId } = request.body

        // Verifica se o usuário que vai ser transferido é um membro da organização
        const transferMembership = await prisma.member.findUnique({
          where: {
            businessId_userId: {
              businessId: business.id,
              userId: transferToUserId,
            },
          },
        })

        // Se o usuário que vai ser transferido não for um membro da organização, lança um erro
        if (!transferMembership) {
          throw new BadRequestError(
            'Target user is not a member of this business.',
          )
        }

        // Adiciona o usuário que vai ser transferido como membro da organização
        // Transaction para garantir a atomicidade das operaçes ou seja executar todas ou nenhuma
        await prisma.$transaction([
          prisma.member.update({
            where: {
              businessId_userId: {
                businessId: business.id,
                userId: transferToUserId,
              },
            },
            data: {
              role: 'ADMIN',
            },
          }),
          prisma.business.update({
            where: { id: business.id },
            data: { ownerId: transferToUserId },
          }),
        ])

        return reply.status(204).send()
      },
    )
}
