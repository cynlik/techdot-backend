import dotenv from 'dotenv';
import cors from "cors";
import express from "express";
import { routes } from "@src/api/routes";

dotenv.config();

const app = express();

const hostname = String(process.env.HOST ?? "127.0.0.1");
const port = Number(process.env.PORT ?? 3001);

app.use(cors());

for (const route of routes) {
  app.use(route.path, route.router);
}

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});