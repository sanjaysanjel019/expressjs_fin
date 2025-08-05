import { addDays, addMonths, startOfMonth } from "date-fns";
import { RecurringIntervalEnum } from "../models/transaction.model";
import { reportInsightPrompt } from "./prompt";
import { convertToDollarsUnit } from "./format-currency";
import { genAI, genAIModel } from "../config/google-ai.config";
import { createUserContent } from "@google/genai";

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
