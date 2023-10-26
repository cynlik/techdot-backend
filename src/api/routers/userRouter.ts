import UserController from '@src/controllers/userController';
import bodyParser from 'body-parser';
import express from 'express';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

router.use(bodyParser.json({ limit: '100mb' }));
router.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

router.use((req: Request, res: Response, next: NextFunction) => {
  console.log('UserController HTTP request');
  next();
});

// router
//   .route('/id/:userId')
//   .get(async (req: Request, res: Response, next: NextFunction) => {
//     res.send('');
//   })
//   .post(async (req: Request, res: Response, next: NextFunction) => {
//     res.send('');
//   })
//   .delete(UserController.authorize(['manage-clients']), async (req: Request, res: Response, next: NextFunction) => {
//     res.send('');
//   });

// //NO FIELDS = GET ALL
// router.route('/search').get(UserController.authorize(['member']), (req: Request, res: Response, next: NextFunction) => {
//   res.send('');
// });

export default router
