import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import { routes } from '@src/api/routes';
import './config';
import { errorHandler } from './middlewares/errorHandler';
import swaggerDocs from '@src/utils/swagger';
import cookieSession from 'cookie-session';
import { slowDown } from 'express-slow-down';

dotenv.config();

const app = express();
const helmet = require('helmet');

const hostname = String(process.env.HOST ?? '127.0.0.1');
const port = Number(process.env.PORT ?? 3000);

const limiter = slowDown({
  delayAfter: 1,
  delayMs: (hits) => hits * 1000,
  maxDelayMs: 4000,
});

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(limiter);
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY1 as string, process.env.COOKIE_KEY2 as string],
  }),
);

for (const route of routes) {
  app.use(route.path, route.router);
}
app.use(errorHandler); // Tratamento de erros
app.disable('x-powered-by');

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);

  swaggerDocs(app, port);
});
