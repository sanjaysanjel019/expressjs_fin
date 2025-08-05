import mongoose from "mongoose";
import TransactionModel from "../../models/transaction.model";
import { calculateNextOccurrence } from "../../utils/helper";

export const processRecurringTransactions = async () => {
  const now = new Date();
  let processedCount = 0;
  let failedCount = 0;

  try {
    const transactionCursor = TransactionModel.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now },
    }).cursor();

    console.log(" 🔂 Starting to process the recurring transactions...");

    for await (const tx of transactionCursor) {
      const nextDate = calculateNextOccurrence(
        tx.nextRecurringDate!,
        tx.recurringInterval!
      );

      console.log("The Transaction is ==>", tx);

      const session = await mongoose.startSession();
      try {
        await session.withTransaction(
          async () => {
            await TransactionModel.create([
              {
                ... tx.toObject(),
                _id: new mongoose.Types.ObjectId(),
                title: `Recurring - ${tx.title}`,
                date: tx.nextRecurringDate,
                isRecurring: false,
                nextRecurringDate: null,
                recurringInterval: null,
                lastProcessedDate: null,
                createdAt:undefined,
                updatedAt:undefined,
              },
              
            ],
            { session }
            );

            await TransactionModel.updateOne(
              {
                id: tx._id,
              },
              {
                $set: {
                  nextRecurringDate: nextDate,
                  lastProcessedDate: now,
                },
              },
              { session }
            );
          },
          {
            maxCommitTimeMS: 20000,
          }
        );

        console.log(`Recurring transaction ${tx._id} processed successfully`);
        processedCount++;
      } catch (error: any) {
        failedCount++;
        console.log("Error processing transaction", error);
        console.log(`Failed ${failedCount} Recurring Transactions : ${tx._id}`);
      }
    }
    console.log("✅ Processed Transaction Count: ", processedCount);
    console.log("❌ Failed Transactions Count: ", failedCount);
    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error: any) {
    console.error("Error processing recurring transactions", error);

    return {
      success: false,
      error: error?.message,
    };
  }
};

export const testTransaction = async () => {
    setTimeout(() => {
    console.log("Im running");
    },5000);
}
