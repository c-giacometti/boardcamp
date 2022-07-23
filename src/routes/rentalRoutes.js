import { Router } from "express";
import { getRentals, newRental, returnRental, deleteRental } from "../controllers/rentalController.js";

const router = Router();

router.get('/rentals', getRentals);
router.post('/rentals', newRental);
router.post('/rentals/:id/return', returnRental);
router.delete('/rentals/:id', deleteRental);

export default router;