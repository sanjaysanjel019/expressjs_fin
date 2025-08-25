import "dotenv/config";
import "./config/passport.config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import passport from "passport";
import { Env } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { BadRequestException } from "./utils/app-error";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import connctDatabase from "./config/database.config";
import authRoutes from "./routes/auth.route";
import { passportAuthenticateJwt } from "./config/passport.config";
import userRoutes from "./routes/user.routes";
import transactionRoutes from "./routes/transaction.route";
import { initializeCrons } from "./crons";
import reportRoute from "./routes/report.route";
import hubSpotRoute from "./routes/hubspot.route";
import analyticsRoutes from "./routes/analytics.route";
import { setupSwagger } from "./swagger";
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

// const now = new Date();
// console.log("Now is --->"+now);

// const yesterday = subDays(now.setHours(0, 0, 0, 0), 1);
// console.log("Yesterday is --->"+yesterday);

app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("This is a test error");
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subcribe to the channel",
    });
  })
);


// Application Routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoute);
app.use(`${BASE_PATH}/`, hubSpotRoute);
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt,analyticsRoutes);

// Enabling the application to use the custom Error Handler
app.use(errorHandler);

// Using Swagger Docs
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Documentation",
    },
    basePath: BASE_PATH,
  },
  apis: [`${__dirname}/routes/*.ts`],
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Starting the application - connect to DB and CRON job initialization
const server = app.listen(Env.PORT, async () => {
  await connctDatabase();

  if (Env.NODE_ENV === "development") {
    await initializeCrons();
    setupSwagger(app)
  }
  console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);

  
});

process.on("unhandledRejection", (err:any) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(()=>{
    process.exit(1);

  })
});
