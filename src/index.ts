import dotenv from 'dotenv';
import cors from "cors";
import express from "express";
import { routes } from "@src/api/routes";
import "./config"
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

const hostname = String(process.env.HOST ?? "127.0.0.1");
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

for (const route of routes) {
  app.use(route.path, route.router);
}
app.use(errorHandler)// Tratamento de erros

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});