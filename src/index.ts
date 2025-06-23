import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import z from 'zod/v4'

const PORT = process.env.PORT || 5001

const init = async () => {
  const app = Fastify({
    logger: true,
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Fastify API',
        description: 'API documentation for Fastify application',
        version: '1.0.0',
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  })

  await app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
  })

  app.after(() => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/tasks',
      schema: {
        body: z.object({
          title: z.string().trim().min(1, { message: 'Title is required' }),
          description: z.string().optional(),
          isCompleted: z.boolean().default(false).optional(),
        }),
        response: {
          201: z.object({
            id: z.string().cuid(),
            title: z.string(),
            description: z.string().optional(),
            isCompleted: z.boolean(),
          }),
        },
      },
      handler: (req, res) => {
        res.send({
          id: 'cuid123',
          title: req.body.title,
          description: req.body.description,
          isCompleted: false,
        })
      },
    })
  })

  try {
    await app.listen({ port: 5001 })
    console.log(`Server is running on http://localhost:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
init()
