import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { findByIdUserService, updateUserService } from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";
import { updateUserSchema } from "../validators/user.validator";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const user = await findByIdUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Get current user successfully",
      data: user
    })

  }
);

export const getGenericUserController = asyncHandler(
    async (req: Request, res: Response) => {
      return res.status(HTTPSTATUS.OK).json({
        message: "You successfully get generic user",
      })
  
    }
  );

export const updateUserSettingController = asyncHandler(
    async (req: Request, res: Response) => {
      const body = updateUserSchema.parse(req.body);
      const userId = req.user?._id;

      const profilePicture = req.file;
      const updatedUser = await updateUserService(userId, body, profilePicture);

      return res.status(HTTPSTATUS.OK).json({
        message: "User Profile updated successfully",
        data: updatedUser
      });
    }
  );
