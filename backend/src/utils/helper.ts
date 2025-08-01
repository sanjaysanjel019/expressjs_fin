import { addDays, addMonths, startOfMonth } from "date-fns";
import { RecurringIntervalEnum } from "../models/transaction.model";

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

    switch(recurringInterval){
      case RecurringIntervalEnum.DAILY:
        return addDays(base,1);
      case RecurringIntervalEnum.WEEKLY:
        return addDays(base,7);
      case RecurringIntervalEnum.MONTHLY:
        return addMonths(base,1);
      case RecurringIntervalEnum.YEARLY:
        return addMonths(base,12);
      default:
        return base;
        
    }
}

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
