import mongoose from "mongoose";
import UserModel from "../models/user.model";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import {
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator";
import { isExternal } from "util/types";
import {
  ReportFrequencyEnum,
  ReportSettingModel,
} from "../models/report-setting.model";
import { calculateNextReportDate } from "../utils/helper";
import { signJwtToken } from "../utils/jwt";

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
        frequency: ReportFrequencyEnum.MONTHLY,
        isEnabled: true,
        lastSentDate: null,
        nextReportDate: calculateNextReportDate(),
      });
      await reportSetting.save({ session });
      return { user: newUser.omitPassword() };
    });
  } catch (err) {
    throw err;
  } finally {
    // Ending the MongoDB session
    session.endSession();
  }
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new NotFoundException("User not found with this email");
  }
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid password");
  }
  const { token, expiresAt } = signJwtToken({ userId: user.id });
  const reportSetting = await ReportSettingModel.findOne(
    { userId: user.id },
    {
      _id: 1,
      frequency: 1,
      isEnabled: 1,
    }
  ).lean();
  if (!reportSetting) {
    throw new NotFoundException("Report Setting not found");
  }

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
    reportSetting,
  };
};
