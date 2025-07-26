import { Router } from "express";
import { registerController } from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerController);

export default authRoutes;
