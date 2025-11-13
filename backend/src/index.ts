import cors from 'cors';
import express from 'express';
import { OpenAPIHandler } from '@orpc/openapi/node';
import { onError } from '@orpc/server';
import { appRouter, createRPCContext } from './router';
import { CONFIGS } from './configs';
import { CORSPlugin } from '@orpc/server/plugins';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import { RPCHandler } from '@orpc/server/node';

const app = express();

app.use(cors());

const handlerRPC = new RPCHandler(appRouter, {
  plugins: [new CORSPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const handlerOpenApi = new OpenAPIHandler(appRouter, {
  plugins: [new CORSPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

app.use('/', async (req, res, next) => {
  console.log(req.headers.authorization);
  const { matched } = await handlerRPC.handle(req, res, {
    prefix: '/rpc',
    context: await createRPCContext({ authorization: req.headers.authorization }),
  });

  const { matched: matchedOpenApi } = await handlerOpenApi.handle(req, res, {
    prefix: '/openApi',
    context: await createRPCContext({ authorization: req.headers.authorization }),
  });

  if (matched || matchedOpenApi) {
    return;
  }

  if (req.url === '/spec.json') {
    const spec = await openAPIGenerator.generate(appRouter, {
      info: {
        title: 'My Playground',
        version: '1.0.0',
      },
      servers: [{ url: '/api/openApi' } /** Should use absolute URLs in production */],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
        },
      },
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(spec));
    return;
  }

  const html = `
    <!doctype html>
    <html>
      <head>
        <title>My Client</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.unnoq.com/icon.svg" />
      </head>
      <body>
        <div id="app"></div>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        <script>
          Scalar.createApiReference('#app', {
            url: '/api/spec.json',
            authentication: {
              securitySchemes: {
                bearerAuth: {
                  token: 'default-token',
                },
              },
            },
          })
        </script>
      </body>
    </html>
  `;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

app.listen(CONFIGS.SERVER_PORT, () => {
  console.log(`Server started on PORT:${CONFIGS.SERVER_PORT}`);
});
