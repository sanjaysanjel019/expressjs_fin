import { Router } from "express";
import { createTransactionController,duplicateTransactionController,getAllTransactionController, getTransactionByIdController } from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.post("/create", createTransactionController);
transactionRoutes.get("/all", getAllTransactionController);

transactionRoutes.put("/duplicate/:id", duplicateTransactionController);

transactionRoutes.get("/:id", getTransactionByIdController);

export default transactionRoutes;
