import userRouter from './routers/userRouter';
import productRouter from "./routers/productRouter";
import categoryRouter from "./routers/categoryRouter";
import subcategoryRouter from "./routers/subcategoryRouter";
import cartRouter from "./routers/cartRouter";
import discountRouter from "./routers/discountRouter"

export const routes = [
  { path: "/api/user", router: userRouter },
  { path: "/api/product", router: productRouter },
  { path: "/api/category", router: categoryRouter },
  { path: "/api/subcategory", router: subcategoryRouter },
  { path: "/api/sale", router: cartRouter},
  { path: "/api/discount", router: discountRouter },
  { path: "/api/cart", router: cartRouter }
  
];
