import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Env } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { ErrorCodeEnum } from "./enums/error-code.enum";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import connectDatabase from "./config/database.config";
import authRoutes from "./routes/auth.route";

const app = express();
const BASE_PATH = Env.BASE_PATH || "/api/v1";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enabling CORS
app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subcribe to the channel",
    });
  })
);

//Adding the Routers
app.use(`${BASE_PATH}/auth`, authRoutes);

// Using Error Handler  on our application
app.use(errorHandler);

// Starting to listen to our application
app.listen(Env.PORT, async () => {
  await connectDatabase();
  console.log(`✅ Server is running on the port : ${Env.PORT} - ${BASE_PATH}`);
});
