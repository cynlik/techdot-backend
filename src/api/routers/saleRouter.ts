import { SaleController } from '@src/controllers/saleController';
import UserController from '@src/controllers/userController';
import express from 'express';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserRole } from "@src/utils/roles";
import validateToken from '@src/middlewares/validateToken'; 


const router = express.Router();
const userController = new UserController();
const saleController = new SaleController();

// Create Sale
router.post('/sale', saleController.create);

// Get All Sales
router.get('/allSales',validateToken, roleMiddleware(UserRole.Manager), saleController.getAll);

// Get Sales By Id
router.get('/sale/:id', validateToken, roleMiddleware(UserRole.Manager), saleController.getById);

// Delete Sale By Id
router.delete('/sale/:id', validateToken, roleMiddleware(UserRole.Manager), saleController.deleteById);

// Update Sale By Id
router.put('/updateSale/:id', saleController.updateById);



export default router;
