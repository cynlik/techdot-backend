//import SaleController from '@src/controllers/saleController';
import UserController from '@src/controllers/userController';
import bodyParser from 'body-parser';
import express from 'express';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

router.use(bodyParser.json({ limit: '100mb' }));
router.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

router.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Sale HTTP request');
  next();
});

//real-all => means that user is logged in

// router.route('/create').post(UserController.authorize(['member']), (req: Request, res: Response, next: NextFunction) => {
//   res.send('');
// });

// router
//   .route('/id/:saleId')
//   .get(UserController.authorize([scopes['Member']]), (req: Request, res: Response, next: NextFunction) => {
//     res.send('');
//   })
//   .delete(UserController.authorize([scopes['Admin']]), (req: Request, res: Response, next: NextFunction) => {
//     res.send('');
//   });

// //NO FIELDS = GET ALL
// router.route('/search').get(UserController.authorize([scopes['Member']]), (req: Request, res: Response, next: NextFunction) => {
//   res.send('');
// });

export default router;
