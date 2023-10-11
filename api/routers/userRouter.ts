import UserController from '../../controllers/userController';
import bodyParser from 'body-parser';
import express from 'express';
import scopes from '../../models/userScopes';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

router.use(bodyParser.json({ limit: '100mb' }));
router.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

router.use((req: Request, res: Response, next: NextFunction) => {
  console.log('UserController HTTP request');
  next();
});

router
  .route('/id/:userId')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    res.send('');
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    res.send('');
  })
  .delete(UserController.authorize([scopes['Admin']]), async (req: Request, res: Response, next: NextFunction) => {
    res.send('');
  });

//NO FIELDS = GET ALL
router.route('/search').get(UserController.authorize(['Member']), (req: Request, res: Response, next: NextFunction) => {
  res.send('');
});

export default router
