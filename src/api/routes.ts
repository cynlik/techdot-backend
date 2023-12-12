import userRouter from './routers/userRouter';
import productRouter from './routers/productRouter';
import categoryRouter from './routers/categoryRouter';
import subcategoryRouter from './routers/subcategoryRouter';
import cartRouter from './routers/cartRouter';
import discountRouter from './routers/discountRouter';
import saleRouter from './routers/saleRouter';
import promoCodeRouter from './routers/promoCodeRouter';

export const routes = [
  { path: '/api/user', router: userRouter },
  { path: '/api/product', router: productRouter },
  { path: '/api/category', router: categoryRouter },
  { path: '/api/subcategory', router: subcategoryRouter },
  { path: '/api/sale', router: saleRouter },
  { path: '/api/discount', router: discountRouter },
  { path: '/api/cart', router: cartRouter },
  { path: '/api/promo-code', router: promoCodeRouter },
];
