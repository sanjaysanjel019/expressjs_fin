import mongoose from "mongoose";
import UserModel from "../models/user.model";
import { UnauthorizedException } from "../utils/app-error";
import { RegisterSchemaType } from "../validators/auth.validator";
import { isExternal } from "util/types";
import { ReportFrequencyEnum, ReportSettingModel } from "../models/report-setting.model";
import { calculateNextReportDate } from "../utils/helper";

export const registerService = async (body: RegisterSchemaType) => {
  const { email, password } = body;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({ email }).session(session);
      if (existingUser) {
        throw new UnauthorizedException("User already exists");
      }

      const newUser = new UserModel({
        ...body,
      });
      await newUser.save({ session });

      //Report Setting Intitialization with creating a new User
      const reportSetting = new ReportSettingModel({
        userId: newUser._id,
        frequency:ReportFrequencyEnum.MONTHLY,
        isExternal:true,
        lastSentDate:null,
        nextReportDate:calculateNextReportDate()
      });
      await reportSetting.save({ session });
      return {user:newUser.omitPassword()};

    });
  } catch (err) {
    throw err;
  } finally {
    await session.endSession();
  }
};
