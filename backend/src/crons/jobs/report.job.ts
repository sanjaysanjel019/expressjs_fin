import {
  endOfMonth,
  format,
  isEqual,
  startOfMonth,
  subMinutes,
  subMonths,
} from "date-fns";
import { ReportSettingModel } from "../../models/report-setting.model";
import { UserDocument } from "../../models/user.model";
import mongoose from "mongoose";
import { generateUserReportService } from "../../services/report.service";
import { ReportStatusEnum } from "../../models/report.model";
import { calculateNextReportDate } from "../../utils/helper";
import { sendReportEmail } from "../../mailers/report.mailer";

export const processReportJob = async () => {
  const now = new Date();
  let processedCount = 0;
  let failedCount = 0;

//   const fromDate = startOfMonth(subMonths(now, 1));
//   const toDate = endOfMonth(subMonths(now, 1));

//   let fromDate = "2025-08-03T18:15:00.000+00:00";
//   let toDate = "2025-08-10T18:15:00.000+00:00";
  let fromDate = new Date("2025-08-03T18:15:00.000+00:00");
  let toDate = new Date("2025-08-10T18:15:00.000+00:00");

  try {
    const reportSettingCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    })
      .populate<{ userId: UserDocument }>("userId")
      .cursor();

    console.log("Running Report");

    for await (const setting of reportSettingCursor) {
      const user = setting.userId as UserDocument;
      if (!user) {
        console.log(`User not found for Settings for Report${setting._id} `);
        continue;
      }

      const session = await mongoose.startSession();

      // Try-catch with generateReportService
      try {
        const report = await generateUserReportService(
          user.id,
          fromDate,
          toDate
        );
        let emailSent = false;

        if (report) {
          try {
            // Todo: Send Email
            await sendReportEmail({
              email: user.email!,
              username: user.name!,
              report: {
                period: report.period,
                totalIncome: report.summary.income,
                totalExpenses: report.summary.expenses,
                availableBalance: report.summary.balance,
                savingsRate: report.summary.savingsRate,
                topSpendingCategories: report.summary.topCategories,
                insights: report.insights,
              },
              frequency: setting.frequency!,
            });
            emailSent = true;
          } catch (e) {
            console.log(`Error sending email for userId : ${user.id}`);
            console.error(e);
          }
        }

        await session.withTransaction(
          async () => {
            const bulkReports: any[] = [];
            const bulkSettings: any[] = [];

            if (report && emailSent) {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period: report.period,
                    status: ReportStatusEnum.SENT,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: now,
                      nextReportDate: calculateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            } else {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period:
                      report?.period ||
                      `${format(fromDate, "MMMM d")}-${format(toDate, "d,yyyy")}}`,
                    status: report
                      ? ReportStatusEnum.FAILED
                      : ReportStatusEnum.NO_ACTIVITY,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: null,
                      nextReportDate: calculateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            }
            await Promise.all([
              ReportSettingModel.bulkWrite(bulkReports, { ordered: false }),
              ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
            ]);
          },
          {
            maxCommitTimeMS: 10000,
          }
        );

        processedCount++;
      } catch (e) {
        failedCount++;
        console.error("generateReportService-->", e);
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅✅ Processed ${processedCount} reports successfully`);
    console.log(`❌❌ Failed to process ${failedCount} reports`);
    console.log(
      `✔️✔️ Finished processing reports at ${format(now, "MMMM d, yyyy hh:mm:ss a")} for ${processedCount} reports and ${failedCount} reports failed to process`
    );
    console.log(`➕➕ Total reports processed: ${processedCount}`);

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (e) {
    console.error("🔴🔴 Error processing reports job", e);
    return {
      success: false,
      errorMessage: "Error processing reports job",
      error: e,
    };
  }
};
