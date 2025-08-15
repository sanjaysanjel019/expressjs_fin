import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { RecurringIntervalEnum } from "../models/transaction.model";
import { reportInsightPrompt } from "./prompt";
import { convertToDollarsUnit } from "./format-currency";
import { genAI, genAIModel } from "../config/google-ai.config";
import { createUserContent } from "@google/genai";
import { DateRangeEnum, DateRangeEnumPreset } from "../enums/date-range.enum";

export function calculateNextReportDate(lastSentDate?: Date): Date {
  const now = new Date();
  const lastSent = lastSentDate || now;

  const nextDate = startOfMonth(addMonths(lastSent, 1));
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

export function calculateNextOccurrence(
  date: Date,
  recurringInterval: keyof typeof RecurringIntervalEnum
) {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);

  switch (recurringInterval) {
    case RecurringIntervalEnum.DAILY:
      return addDays(base, 1);
    case RecurringIntervalEnum.WEEKLY:
      return addDays(base, 7);
    case RecurringIntervalEnum.MONTHLY:
      return addMonths(base, 1);
    case RecurringIntervalEnum.YEARLY:
      return addMonths(base, 12);
    default:
      return base;
  }
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function calculateSavingsRate(
  totalIncome: number,
  totalExpense: number
) {
  if (totalIncome <= 0) {
    return 0;
  }
  const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
  return parseFloat(savingsRate.toFixed(2));
}

export async function generateAIInsights({
  totalIncome,
  totalExpenses,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}: {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  savingsRate: number;
  categories: Record<string, { amount: number; percentage: number }>;
  periodLabel: string;
}) {
  try {
    const prompt = reportInsightPrompt({
      totalIncome: convertToDollarsUnit(totalIncome),
      totalExpenses: convertToDollarsUnit(totalExpenses),
      availableBalance: convertToDollarsUnit(availableBalance),
      savingsRate: Number(savingsRate.toFixed(1)),
      categories,
      periodLabel,
    });

    const result = await genAI.models.generateContent({
      model: genAIModel,
      contents: [createUserContent([prompt])],
      config: {
        responseMimeType: "application/json",
      },
    });

    const response = result.text;
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

    if (!cleanedText) return [];

    const data = JSON.parse(cleanedText);
    return data;
  } catch (error) {
    return [];
  }
}

// Helper Function to get the Date Range that user may use for the Analytics in the Dashboard
export function getDateRange(
  preset?: DateRangeEnumPreset,
  customFrom?: Date,
  customTo?: Date
) {
  if (customFrom && customTo) {
    return {
      from: customFrom,
      to: customTo,
      value: DateRangeEnum.CUSTOM,
    };
  }

  const now = new Date(); 
  const yesterday = subDays(now.setHours(0, 0, 0, 0), 1);
  const last30Days = {
    from: subDays(yesterday, 29),
    to: yesterday,
    value: DateRangeEnum.LAST_30_DAYS,
    label: "Last 30 Days",
  };

  switch (preset) {
    case DateRangeEnum.ALL_TIME:
      return {
        from: null,
        to: null,
        value: DateRangeEnum.ALL_TIME,
        label: "All Time",
      };
    case DateRangeEnum.LAST_30_DAYS:
      return last30Days;
    case DateRangeEnum.LAST_MONTH:
      return {
        from: startOfMonth(subMonths(now, 1)),
        to: endOfMonth(subMonths(now, 1)),
        value: DateRangeEnum.LAST_MONTH,
        label: "Last Month",
      };
    case DateRangeEnum.LAST_3_MONTHS:
      return {
        from: startOfMonth(subMonths(now, 3)),
        to: endOfMonth(subMonths(now, 1)),
        value: DateRangeEnum.LAST_3_MONTHS,
        label: "Last 3 Months",
      };
    case DateRangeEnum.LAST_YEAR:
      return {
        from: startOfYear(subYears(now, 1)),
        to: endOfYear(subYears(now, 1)),
        value: DateRangeEnum.LAST_YEAR,
        label: "Last Year",
      };
    case DateRangeEnum.THIS_MONTH:
      return {
        from: startOfMonth(now),
        to: endOfDay(now),
        value: DateRangeEnum.THIS_MONTH,
        label: "This Month",
      };
    case DateRangeEnum.THIS_YEAR:
      return {
        from: startOfYear(now),
        to: endOfDay(now),
        value: DateRangeEnum.THIS_YEAR,
        label: "This Year",
      };
    default:
      return last30Days;
  }
}

export function calculatePercentageChange(previous: number, current: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return parseFloat(change.toFixed(2));
}
