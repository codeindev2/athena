import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

import { BadRequestError } from './routes/_error/bad-request'
import { ConflictError } from './routes/_error/conflict'
import { NotFoundError } from './routes/_error/not-found'
import { UnauthorizedError } from './routes/_error/unauthorization'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BadRequestError) {
    reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    reply.status(401).send({
      message: error.message,
    })
  }

  if (error instanceof NotFoundError) {
    reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof ConflictError) {
    reply.status(409).send({
      message: error.message,
    })
  }

  console.error(error)

  // send error to some observability platform

  reply.status(500).send({ message: 'Internal server error' })
}
