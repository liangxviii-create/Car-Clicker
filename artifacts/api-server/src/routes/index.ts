import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leaderboardRouter from "./leaderboard";
import savesRouter from "./saves";
import tradesRouter from "./trades";
import communityVehiclesRouter from "./community-vehicles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leaderboardRouter);
router.use(savesRouter);
router.use(tradesRouter);
router.use(communityVehiclesRouter);

export default router;
