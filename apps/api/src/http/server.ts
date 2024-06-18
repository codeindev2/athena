import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { env } from '@saas/env'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from './error-handler'
import { createAppointment } from './routes/appointment/create-appointment'
import { getAppointment } from './routes/appointment/get-appointment'
import { getListAppointments } from './routes/appointment/get-list-appointments'
import { listEmployeeAvailableHours } from './routes/appointment/list-employee-day-available-hours'
import { listAppointments } from './routes/appointment/post-list-appointments'
import { authenticateWithGithub } from './routes/auth/authenticate-with-github'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import { createAccount } from './routes/auth/create-account'
import { getProfile } from './routes/auth/get-profile'
import { requestPasswordRecover } from './routes/auth/request-password-recover'
import { resetPassword } from './routes/auth/reset-password'
import { createBusiness } from './routes/business/create-business'
import { getBusiness } from './routes/business/get-business'
import { getBusinessAll } from './routes/business/get-business-all'
import { getMembership } from './routes/business/get-membership'
import { shutdownBusiness } from './routes/business/shutdown-business'
import { updateBusiness } from './routes/business/update-business'
import { createMember } from './routes/member/create-member'
import { deleteMember } from './routes/member/delete-member'
import { getMember } from './routes/member/get-member'
import { getMembers } from './routes/member/get-members'
import { updateMember } from './routes/member/update-member'
import { createProduct } from './routes/product/create-product'
import { deleteProduct } from './routes/product/delete-product'
import { getProduct } from './routes/product/get-product'
import { getProducts } from './routes/product/get-products'
import { updateProduct } from './routes/product/update-product'
import { createService } from './routes/service/create-service'
import { deleteService } from './routes/service/delete-service'
import { getService } from './routes/service/get-service'
import { getServices } from './routes/service/get-services'
import { updateService } from './routes/service/update-service'

const app = fastify().withTypeProvider<ZodTypeProvider>()

// Serializador e Validador
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.setErrorHandler(errorHandler)

// Configuração do Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'codeindev49 API Athena',
      description:
        'codeindev49 API Athena sistema de gerenciamento de serviços e produtos',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

// Swagger UI
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

// Cors
app.register(fastifyCors)

// JWT
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

// Rotas
app.register(createAccount)
app.register(authenticateWithPassword)
app.register(authenticateWithGithub)
app.register(getProfile)
app.register(requestPasswordRecover)
app.register(resetPassword)

// Organizações
app.register(createBusiness)
app.register(getMembership)
app.register(getBusiness)
app.register(getBusinessAll)
app.register(updateBusiness)
app.register(shutdownBusiness)

// Produtos
app.register(createProduct)
app.register(deleteProduct)
app.register(getProduct)
app.register(getProducts)
app.register(updateProduct)

// Serviços
app.register(createService)
app.register(getService)
app.register(getServices)
app.register(updateService)
app.register(deleteService)

// Membros
app.register(createMember)
app.register(getMembers)
app.register(deleteMember)
app.register(getMember)
app.register(updateMember)

// Agendamentos
app.register(createAppointment)
app.register(listAppointments)
app.register(getListAppointments)
app.register(listEmployeeAvailableHours)
app.register(getAppointment)

// Inicialização do servidor
app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log('HTTP server running!')
})
