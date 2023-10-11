import dotenv from 'dotenv';
import cors from "cors";
import express from "express";
import http from "http";
import { routes } from "./api/routes";

dotenv.config();

const app = express();
const hostname = process.env.HOST ?? "127.0.0.1";
const port = process.env.PORT ?? 3001;
const server = http.createServer(app);

app.use(cors());

for (const route of routes) {
  app.use(route.path, route.router);
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
