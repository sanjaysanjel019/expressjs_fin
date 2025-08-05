import mongoose from "mongoose";

export enum ReportFrequencyEnum {
  MONTHLY = "MONTHLY", 
}

export interface ReportSettingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  frequency: keyof typeof ReportFrequencyEnum;
  isEnabled: boolean;
  nextReportDate?: Date;
  lastSentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSettingSchema = new mongoose.Schema<ReportSettingDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    nextReportDate: {
      type: Date,
    },
    lastSentDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const ReportSettingModel = mongoose.model<ReportSettingDocument>(
  "ReportSetting",
  reportSettingSchema
);

