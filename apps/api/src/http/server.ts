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
import { createProduct } from './routes/products/create-product'
import { deleteProduct } from './routes/products/delete-product'
import { getProduct } from './routes/products/get-product'
import { getProducts } from './routes/products/get-products'
import { updateProduct } from './routes/products/update-product'
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
      title: 'Athena API',
      description: 'Documentação da API Athena',
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

// Inicialização do servidor
app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log('HTTP server running!')
})
