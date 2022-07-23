import { Router } from "express";
import { getGames, newGame } from "../controllers/gameController.js";

const router = Router();

router.get('/games', getGames);
router.post('/games', newGame);

export default router;