import userRouter from './routers/userRouter';
import productRouter from "./routers/productRouter";
import categoryRouter from "./routers/categoryRouter";
import subcategoryRouter from "./routers/subcategoryRouter";

export const routes = [
  { path: "/api/user", router: userRouter },
  { path: "/api/product", router: productRouter },
  { path: "/api/category", router: categoryRouter },
  { path: "/api/subcategory", router: subcategoryRouter }
];
