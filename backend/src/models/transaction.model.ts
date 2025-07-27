import mongoose, { Schema } from "mongoose";
import { convertToCents } from "../utils/format-currency";

export enum TransactionTypeEnum {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum RecurringStatusTypeEnum {
  RECURRING = "RECURRING",
  NON_RECURRING = "NON_RECURRING",
}

export enum RecurringIntervalEnum {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum TransactionStatusEnum {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum PaymentMethodEnum {
  MOBILE_PAYMENT = "MOBILE_PAYMENT",
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  OTHER = "OTHER",
}

export interface TransactionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: keyof typeof TransactionTypeEnum;
  title: string;
  amount: number;
  category: string;
  receiptUrl?: string;
  recurringInterval?: keyof typeof RecurringIntervalEnum;
  nextRecurringDate?: Date;
  lastProcessedDate?: Date;
  isRecurring: boolean;
  description?: string;
  date: Date;
  status: keyof typeof TransactionStatusEnum;
  paymentMethod: keyof typeof PaymentMethodEnum;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionTypeEnum),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      set: (value: number) => convertToCents(value),
      get: (value: number) => convertToCents(value),
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    receiptUrl: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
      enum: Object.values(RecurringIntervalEnum),
      default: null,
    },
    nextRecurringDate: {
      type: Date,
    },
    lastProcessedDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatusEnum),
      default: TransactionStatusEnum.COMPLETED,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethodEnum),
      default: PaymentMethodEnum.CASH,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      virtuals: true,
    },
    toObject: {
      getters: true,
      virtuals: true,
    },
  }
);

const TransactionModel = mongoose.model<TransactionDocument>(
  "Transaction",
  transactionSchema
);
export default TransactionModel;