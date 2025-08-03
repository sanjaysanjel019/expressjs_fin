import {z} from "zod";
import { PaymentMethodEnum, RecurringIntervalEnum, TransactionTypeEnum } from "../models/transaction.model";

export const transactionIdSchema = z.string().trim().min(1);

export const baseTransactionSchema = z.object({
    title:z.string().min(1,'Title is required'),
    type:z.enum([TransactionTypeEnum.INCOME,TransactionTypeEnum.EXPENSE], {
        errorMap : () => ({
            message:"Transaction type must either be INCOME or EXPENSE"
        }),
    }),
    description:z.string().optional(),
    amount:z.number().positive().min(1,'Amount is required and must be positive'),
    category:z.string().min(1,'Category is required'),
    date:z.union([z.string().datetime({message:"Invalid date string"}), z.date()]).transform((val)=>new Date(val)),
    isRecurring:z.boolean().default(false),
    recurringInterval:z.enum([
        RecurringIntervalEnum.DAILY,
        RecurringIntervalEnum.WEEKLY,
        RecurringIntervalEnum.MONTHLY,
        RecurringIntervalEnum.YEARLY,
    ]).nullable().optional(),
    receiptUrl:z.string().url().nullable().optional(),
    paymentMethod:z.enum([
        PaymentMethodEnum.CASH,
        PaymentMethodEnum.CREDIT_CARD,
        PaymentMethodEnum.BANK_TRANSFER,
        PaymentMethodEnum.MOBILE_PAYMENT,
        PaymentMethodEnum.OTHER,
    ]).default(PaymentMethodEnum.CASH),
});

export const bulkDeleteTransactionSchema = z.object({
    transactionIds:z.array(z.string().length(24,"invalid transactionID format")).min(1,"At least 1 TransactionID must be provided")
});

export const bulkTransactionSchema = z.object({
    transactions : z.array(baseTransactionSchema).max(200,"Cannot add more that 200 transactions")
    .refine(
        (txs)=>txs.every((tx) =>{
            const amount = Number(tx.amount);
            return !isNaN(amount) && amount>0 && amount <=1_000_000; 
        }),{
            message:"Amount must be a positive number"
        }
    ),
});

export const createTransactionSchema = baseTransactionSchema;
export const updateTransactionSchema = baseTransactionSchema.partial();

export type CreateTransactionType = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionType = z.infer<typeof updateTransactionSchema>;
export type BulkDeleteTransactionType = z.infer<typeof bulkDeleteTransactionSchema>;