import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import { routes } from '@src/api/routes';
import './config';
import { errorHandler } from './middlewares/errorHandler';
import swaggerDocs from '@src/utils/swagger';
import cookieSession from 'cookie-session';
import { slowDown } from 'express-slow-down';
import helmet from 'helmet';
import path from 'path';

dotenv.config();

const app = express();

const hostname = String(process.env.HOST ?? '127.0.0.1');
const port = Number(process.env.PORT ?? 3000);

app.set('trust proxy', 1);

app.use(
  cors({
    origin: '*',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  }),
);
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(helmet());
app.use(
  slowDown({
    delayAfter: 20,
    delayMs: (hits) => hits * 1000,
    maxDelayMs: 4000,
  }),
);
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY1 as string, process.env.COOKIE_KEY2 as string],
  }),
);

for (const route of routes) {
  app.use(route.path, route.router);
}
app.use(errorHandler);
app.disable('x-powered-by');

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);

  swaggerDocs(app, port);
});
