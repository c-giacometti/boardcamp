import { Router } from 'express';
import { getCategories, newCategory } from '../controllers/categoryController.js';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', newCategory);

export default router;