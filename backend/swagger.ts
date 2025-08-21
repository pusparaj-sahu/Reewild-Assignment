import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Foodprint API',
    version: '1.0.0',
  },
  servers: [{ url: '/api' }],
  paths: {
    '/estimate': {
      post: {
        summary: 'Estimate carbon footprint from dish name',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { dish: { type: 'string' }, servings: { type: 'integer', minimum: 1, maximum: 25 } },
                required: ['dish'],
              },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/estimate/image': {
      post: {
        summary: 'Estimate from uploaded dish image',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary' },
                  servings: { type: 'integer', minimum: 1, maximum: 25 },
                },
                required: ['image'],
              },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
  },
};

export const swaggerMiddleware = Router().use('/', swaggerUi.serve, swaggerUi.setup(spec));


