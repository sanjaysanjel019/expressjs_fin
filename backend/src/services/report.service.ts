import mongoose from "mongoose";
import {
  ReportFrequencyEnum,
  ReportSettingModel,
} from "../models/report-setting.model";
import ReportModel from "../models/report.model";
import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";
import { NotFoundException } from "../utils/app-error";
import {
  calculateNextReportDate,
  calculateSavingsRate,
  generateAIInsights,
} from "../utils/helper";
import { UpdateReportSettingDTO } from "../validators/report.validator";
import { convertToDollarsUnit } from "../utils/format-currency";
import { format } from "date-fns";

export const getAllReportService = async (
  userId: string,
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const query: Record<string, any> = { userId };

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [reports, totalCount] = await Promise.all([
    ReportModel.find(query).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
    ReportModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reports,
    pagination: {
      pageSize,
      pageNumber,
      totalPages,
      totalCount,
      skip,
    },
  };
};

export const updateReportSettingService = async (
  userId: string,
  body: UpdateReportSettingDTO
) => {
  const { isEnabled } = body;
  let nextReportDate: Date | null = null;

  const existingReportSetting = await ReportSettingModel.findOne({ userId });
  if (!existingReportSetting) {
    throw new NotFoundException("Report Setting not found");
  }

  const frequent =
    existingReportSetting.frequency || ReportFrequencyEnum.MONTHLY;

  if (isEnabled) {
    const currentNextReportDate = existingReportSetting.nextReportDate;
    const now = new Date();
    if (!currentNextReportDate || currentNextReportDate < now) {
      nextReportDate = calculateNextReportDate(
        existingReportSetting.lastSentDate
      );
    } else {
      nextReportDate = currentNextReportDate;
    }
  }

  existingReportSetting.set({
    ...body,
    nextReportDate,
  });
  await existingReportSetting.save();
};

export const generateUserReportService = async (
  userId: string,
  fromDate: Date,
  toDate: Date
) => {
  const result = await TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalIncome: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", TransactionTypeEnum.INCOME] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },
              totalExpenses: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },
            },
          },
        ],
        categories: [
          {
            $match: { $type: TransactionTypeEnum.EXPENSE },
          },
          {
            $group: {
              _id: "$category",
              total: { $sum: { $abs: "$amount" } },
            },
          },
          {
            $sort: { total: -1 },
          },
          {
            $limit: 5,
          },
        ],
      },
    },
    {
      $project: {
        totalIncome: { $arrayElemtAt: ["$summary.totalIncome", 0] },
        totalExpenses: { $arrayElemtAt: ["$summary.totalExpenses", 0] },
        categories: 1,
      },
    },
  ]);

  if (
    !result?.length ||
    (result[0]?.totalIncome === 0 && result[0]?.totalExpenses === 0)
  ) {
    return null;
  }

  const {
    totalIncome = 0,
    totalExpenses = 0,
    categories = [],
  } = result[0] || {};
  const byCategory = categories.reduce(
    (acc: any, { _id, total }: any) => {
      acc[_id] = {
        amount: convertToDollarsUnit(total),
        percentage:
          totalExpenses > 0 ? Math.round(total / totalExpenses) * 100 : 0,
      };
      return acc;
    },
    {} as Record<string, { amount: number; percentage: number }>
  );

  const availableBalance = totalIncome - totalExpenses;
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  const periodLabel = `${format(fromDate, "MMMM d")} - ${format(toDate, "d, yyyy")}`;

  const insights = generateAIInsights({
    totalIncome,
    totalExpenses,
    availableBalance,
    savingsRate,
    categories: byCategory,
    periodLabel: periodLabel,
  });

  return {
    period: periodLabel,
    summary: {
      income: convertToDollarsUnit(totalIncome),
      expenses: convertToDollarsUnit(totalExpenses),
      balance: convertToDollarsUnit(availableBalance),
      savingsRate: Number(savingsRate.toFixed(1)),
      topCategories: Object.entries(byCategory)?.map(([name, cat]: any) => ({
        name,
        amount: cat.amount,
        percent: cat.percentage,
      })),
    },
    insights,
  };
};
