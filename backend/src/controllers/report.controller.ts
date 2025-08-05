import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { generateUserReportService, getAllReportService, updateReportSettingService } from "../services/report.service";
import { updateReportSettingSchema } from "../validators/report.validator";

export const getAllReportsController = asyncHandler(async(req:Request, res:Response)=>{
const userId = req.user?.id;

const pagination = {
    pageSize: parseInt(req.query.pageSize as string) || 20,
    pageNumber : parseInt(req.query.pageNumber as string) || 1,
}

const result = await getAllReportService(userId,pagination)

return res.status(HTTPSTATUS.OK).json({
    message:"Reports Fetched Successfully",
    ...result
});

});

export const updateReportSettingController = asyncHandler(async(req:Request, res:Response)=>{

    const userId = req.user?._id;
    const body = updateReportSettingSchema.parse(req.body);

    await updateReportSettingService(userId,body);

    return res.status(HTTPSTATUS.OK).json({
        message:"Report Setting Updated Successfully",
    });

});

export const generateReportController = asyncHandler(async(req:Request, res:Response)=>{

    const userId = req.user?._id;
    const {from, to} = req.query;
    const fromDate = new Date (from as string);
    const toDate = new Date (to as string);
    const body = updateReportSettingSchema.parse(req.body);

    await generateUserReportService(userId,fromDate,toDate);

    return res.status(HTTPSTATUS.OK).json({
        message:"Report Setting Updated Successfully",
    });

});