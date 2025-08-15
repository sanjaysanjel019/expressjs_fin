import { HTTPSTATUS } from "../config/http.config";
import { DateRangeEnum, DateRangeEnumPreset } from "../enums/date-range.enum";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { chartAnalyticsService, summaryAnalyticsService } from "../services/analytics.service";

export const summaryAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId:any = req.user?._id;

    console.log("userId is --->", userId);

    const { preset, from, to } = req.query;
    const filter = {
      dateRangePreset: preset as DateRangeEnumPreset,
      customFrom: from ? new Date(from as string) : undefined,
      customTo: to ? new Date(to as string) : undefined,
    };

    const stats = await summaryAnalyticsService(
      userId,
      filter.dateRangePreset,
      filter.customFrom,
      filter.customTo
    );
 
    return res.status(HTTPSTATUS.OK).json({
      message: "Get current user successfully",
      data: stats,
    });
  }
);
export const chartAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId:any = req.user?._id;
    const {preset, from , to} = req.query;

    const filter = {
      dateRangePreset: preset as DateRangeEnumPreset,
      customFrom: from? new Date(from as string) : undefined,
      customTo: to? new Date(to as string) : undefined,
    };

    const chartData = await chartAnalyticsService(
      userId,
      filter.dateRangePreset,
      filter.customFrom,
      filter.customTo
    )

    return res.status(HTTPSTATUS.OK).json({
      message: "Get chart data successfully",
      data: chartData,
    });


  })
