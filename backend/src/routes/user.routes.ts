import { Router } from "express";
import { getCurrentUserController, getGenericUserController, updateUserSettingController } from "../controllers/user.controller";
import { upload } from "../config/cloudinary.config";

const userRoutes = Router();

userRoutes.get("/", getGenericUserController);
userRoutes.get("/current-user", getCurrentUserController);
userRoutes.put("/update-setting", upload.single("profile-picture"), updateUserSettingController);

export default userRoutes;
