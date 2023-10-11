import saleRouter from "./routers/saleRouter";
import userRouter from "./routers/userRouter";
import authRouter from "./routers/authRouter";

export const routes = [
  { path: "/api/sale", router: saleRouter },
  { path: "/api/user", router: userRouter },
  { path: "/api/auth", router: authRouter },
];
