import { Router } from "express";
import { bulkDeleteTransactionController, bulkTransactionController, createTransactionController,deleteTransactionController,duplicateTransactionController,getAllTransactionController, getTransactionByIdController, updateTransactionController } from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.get("/all", getAllTransactionController);

transactionRoutes.post("/create", createTransactionController);
transactionRoutes.get("/bulk-transaction", bulkTransactionController);


transactionRoutes.put("/duplicate/:id", duplicateTransactionController);
transactionRoutes.put("/update/:id", updateTransactionController);
transactionRoutes.delete("/delete/:id", deleteTransactionController);
transactionRoutes.delete("/bulk-delete", bulkDeleteTransactionController);


transactionRoutes.get("/:id", getTransactionByIdController);

export default transactionRoutes;
