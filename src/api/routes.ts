import saleRouter from "@src/api/routers/saleRouter";
import userRouter from "@src/api/routers/userRouter";
import authRouter from "@src/api/routers/authRouter";

export const routes = [
  { path: "/api/sale", router: saleRouter },
  { path: "/api/user", router: userRouter },
  { path: "/api/auth", router: authRouter },
];
