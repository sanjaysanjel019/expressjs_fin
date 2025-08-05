import { Router } from "express";
import { getAllReportsController, updateReportSettingController } from "../controllers/report.controller";

const reportRoute = Router();

reportRoute.get("/all", getAllReportsController);
reportRoute.put("/update-setting", updateReportSettingController);

export default reportRoute;
