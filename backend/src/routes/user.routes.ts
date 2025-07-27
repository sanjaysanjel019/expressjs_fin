import { Router } from "express";
import { getCurrentUserController, getGenericUserController } from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.get("/", getGenericUserController);
userRoutes.get("/current-user", getCurrentUserController);

export default userRoutes;
