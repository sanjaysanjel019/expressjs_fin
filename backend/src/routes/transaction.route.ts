import { Router } from "express";
import { createTransactionController,duplicateTransactionController,getAllTransactionController, getTransactionByIdController, updateTransactionController } from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.post("/create", createTransactionController);
transactionRoutes.get("/all", getAllTransactionController);

transactionRoutes.put("/duplicate/:id", duplicateTransactionController);
transactionRoutes.get("/update/:id", updateTransactionController);


transactionRoutes.get("/:id", getTransactionByIdController);

export default transactionRoutes;
