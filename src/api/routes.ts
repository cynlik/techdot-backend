import saleRouter from "@src/api/routers/saleRouter";
import userRouter from "@src/api/routers/userRouter";

export const routes = [
  { path: "/api/sale", router: saleRouter },
  { path: "/api/user", router: userRouter },
];
