import saleRouter from "./routers/saleRouter";
import userRouter from "./routers/userRouter";
import productRouter from "./routers/productRouter";

export const routes = [
  { path: "/api/sale", router: saleRouter },
  { path: "/api/user", router: userRouter },
  { path: "/api/product", router: productRouter }
];
