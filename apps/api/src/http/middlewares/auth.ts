import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

import { prisma } from '@/lib/prisma'

import { UnauthorizedError } from '../routes/_error/unauthorization'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch {
        throw new UnauthorizedError('Invalid token')
      }
    }

    // Usado para pegar o membro da organização atraves do slug
    request.getUserMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId()

      const member = await prisma.member.findFirst({
        where: {
          userId,
          business: {
            slug,
          },
        },
        include: {
          business: true,
        },
      })

      if (!member) {
        throw new UnauthorizedError('User is not a member of this business')
      }

      const { business, ...membership } = member

      return {
        business,
        membership,
      }
    }
  })
})
