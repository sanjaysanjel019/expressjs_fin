import { Router } from "express";
import { generateReportController, getAllReportsController, updateReportSettingController } from "../controllers/report.controller";

const reportRoute = Router();

reportRoute.get("/all", getAllReportsController);
reportRoute.get("/generate-report", generateReportController);
reportRoute.put("/update-setting", updateReportSettingController);

export default reportRoute;
