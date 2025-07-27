import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { findByIdUserService } from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("❣️❣️❣️")
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
      console.log("❣️I ❣️LOVE❣️YOU!")
      return res.status(HTTPSTATUS.OK).json({
        message: "You successfully get generic user",
      })
  
    }
  );
