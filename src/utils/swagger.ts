import { Express, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../package.json';
import log from '@src/utils/logger';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'REST API Docs',
      version: version,
    },
    components: {
      schemas: {
        CartPutRequest: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
            },
            quantity: {
              type: 'number',
              default: 1,
            },
            action: {
              type: 'enum',
              enum: ['add', 'remove', 'removeAll', 'removeProduct'],
            }
          },
        },
        CartRequest: {
          type: 'object',
          properties: {
            quantity: {
              type: 'number',
              default: 1,
            },
          },
        },
        CartResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            cart: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: {
                    $ref: '#/components/schemas/Product',
                  },
                  quantity: {
                    type: 'number',
                  },
                  totalPrice: {
                    type: 'string',
                  },
                },
              },
            },
            cartTotal: {
              type: 'number',
            },
          },
        },
        CartQuantity: {
          type: 'object',
          properties: {
            quantity: {
              type: 'number',
              default: 1,
            },
          },
        },
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
            password: {
              type: 'string',
            },
            role: {
              type: 'string',
            },
            picture: {
              type: 'string',
            },
            age: {
              type: 'number',
            },
            address: {
              type: 'string',
            },
            country: {
              type: 'string',
            },
          },
        },
        RegisterUser: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
            password: {
              type: 'string',
            },
          },
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
          },
        },
        LoginUser: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
            },
            password: {
              type: 'string',
            },
          },
        },
        LoginUserResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        ForgetPassword: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
            },
          },
        },
        ForgetPasswordResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
          },
        },
        ResetPassword: {
          type: 'object',
          properties: {
            newPassword: {
              type: 'string',
            },
            confirmPassword: {
              type: 'string',
            },
          },
        },
        Me: {
          type: 'object',
          properties: {
            newPassword: {
              type: 'string',
            },
            confirmPassword: {
              type: 'string',
            },
          },
        },
        ChangeView: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            view: {
              type: 'string',
            },
            accessToken: {
              type: 'string',
            },
          },
        },
        Product: {
          type: 'object',
          required: ['name', 'description', 'imageUrl', 'manufacturer', 'stockQuantity', 'price', 'visible', 'subcategoryId', 'productType', 'specifications'],
          properties: {
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            imageUrl: {
              type: 'string',
            },
            manufacturer: {
              type: 'string',
            },
            stockQuantity: {
              type: 'number',
            },
            price: {
              type: 'number',
            },
            visible: {
              type: 'boolean',
            },
            subcategoryId: {
              type: 'string',
            },
            productType: {
              type: 'string',
            },
            specifications: {
              type: 'object',
            },
          },
        },
        SingleMessageResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
          },
        },
        Sale: {
          type: 'object',
          required: ['userId', 'products', 'date', 'totalAmount'],
          properties: {
            userId: {
              type: 'string',
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: {
                    type: 'object',
                  },
                  quantity: {
                    type: 'number',
                  },
                },
              },
            },
            date: {
              type: 'string',
            },
            totalAmount: {
              type: 'number',
            },
          },
        },
      },
    },
  },
  apis: ['./src/api/routers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
  // Swagger page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

  // Docs in JSON format
  app.get('/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  log.info(`Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;
