import { Router } from "express";
import { chartAnalyticsController, summaryAnalyticsController } from "../controllers/analytics.controller";

const analyticsRoutes = Router();

analyticsRoutes.get("/summary", summaryAnalyticsController);
analyticsRoutes.get("/charts", chartAnalyticsController);

export default analyticsRoutes;
