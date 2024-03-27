import swaggerJsdoc from 'swagger-jsdoc'
import Express from 'express'

export function generateSwaggerSpecs(req: Express.Request) {

  // Get the host from the request´
  const protocol = req.get('X-forwarded-proto') || req.protocol
  const host = req.get('host')
  const baseUrl = process.env.BASE_URL || ''


  const options = {
    definition: {
      openapi: '3.0.0',
      servers: [
        {
          url: `${protocol}://${host}${baseUrl}`,
        }
      ],
      info: {
        title: 'Personal Budget API',
        version: '1.0.0',
        description: 'API that allows you to create a budget and track expenses',
        contact: {
          email: 'jimmy@kodsmed.se'
        },
        license:{
          name: 'MIT',
          url: 'https://opensource.org/license/mit'
        }
      },
      tags:[
        {
          name: 'documentation',
          description: 'Provides a link to this documentation',
        },
        {
          name: 'authentication',
          description: 'Handle user authentication'
        },
        {
          name: 'users',
          description: 'Handle user registration, update and removal'
        },
        {
          name: 'budgets',
          description: 'Handle a budget and it\'s tracked expences'
        },
        {
          name: 'categories',
          description: 'Handle the categories for a budget'
        },
        {
          name: 'expenses',
          description: 'Handle the expenses for a category'
        },
        {
          name: 'webhooks',
          description: 'Register, remove or check status for available webhooks'
        }
      ]

    },
    // Path to the API docs
    apis: [
      './src/swagger-docs/*.js',
      './src/swagger-docs/*.yaml',
      './src/routes/api/v1/*.ts',
    ]
  }
  const swaggerSpec = swaggerJsdoc(options)
  return swaggerSpec
}
