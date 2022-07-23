import { Router } from 'express';
import { getCustomers, getCustomerById, newCustomer, updateCustomer } from '../controllers/customerController.js';

const router = Router();

router.get('/customers', getCustomers);
router.get('/customer/:id', getCustomerById);
router.post('/customers', newCustomer);
router.put('/customers/:id', updateCustomer);

export default router;

