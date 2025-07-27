import { Router } from "express";
import { createTransactionController,getAllTransactionController } from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.post("/create", createTransactionController);
transactionRoutes.get("/all", getAllTransactionController);

export default transactionRoutes;
