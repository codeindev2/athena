import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { createSlug } from '@/utils/create-slug'

import { BadRequestError } from '../_error/bad-request'

export async function createBusiness(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/business',
      {
        schema: {
          tags: ['Business'],
          summary: 'Create an business',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
          response: {
            201: z.object({
              businessId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { name, domain, shouldAttachUsersByDomain } = request.body

        if (domain) {
          const businessByDomain = await prisma.business.findFirst({
            where: {
              domain,
            },
          })

          if (businessByDomain) {
            throw new BadRequestError(
              'Another business with the same domain already exists',
            )
          }
        }

        const business = await prisma.business.create({
          data: {
            name,
            domain,
            slug: createSlug(name),
            shouldAttachUsersByDomain,
            ownerId: userId,
            members: {
              create: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        })

        return reply.send({ businessId: business.id })
      },
    )
}
