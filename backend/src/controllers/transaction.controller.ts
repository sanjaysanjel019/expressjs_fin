import {Request,Response} from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { createTransactionSchema, transactionIdSchema, updateTransactionSchema } from "../validators/transaction.validator";
import { createTransactionService, duplicateTransactionService, getAllTransactionService, getTransactionyByIdService, updateTransactionService } from "../services/transaction.service";
import { HTTPSTATUS } from "../config/http.config";
import TransactionModel, { RecurringStatusTypeEnum, TransactionTypeEnum } from "../models/transaction.model";


// Creates a new Transaction
export const createTransactionController = asyncHandler(async(req:Request,res:Response)=>{
    const body = createTransactionSchema.parse(req.body);
    const userId = req.user?._id;

    const newTransaction = await createTransactionService(body,userId);
    return res.status(HTTPSTATUS.CREATED).json({
        message:"Transaction created successfully",
        newTransaction
    })
});

// Gets all the transactions
export const getAllTransactionController = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?._id;
  
      const filters = {
        keyword: req.query.keyword as string | undefined,
        type: req.query.type as keyof typeof TransactionTypeEnum | undefined,
        recurringStatus: req.query.recurringStatus as
          | "RECURRING"
          | "NON_RECURRING"
          | undefined,
      };
  
      const pagination = {
        pageSize: parseInt(req.query.pageSize as string) || 20,
        pageNumber: parseInt(req.query.pageNumber as string) || 1,
      };
  
      const result = await getAllTransactionService(userId, filters, pagination);
  
      return res.status(HTTPSTATUS.OK).json({
        message: "Transaction fetched successfully",
        ...result,
      });
    }
  );


  export const getTransactionByIdController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    const transaction = await getTransactionyByIdService(userId,transactionId)

    return res.send(HTTPSTATUS.OK).json({
      message:"Transaction fetched successfully", 
      transaction
    })
  });

  export const duplicateTransactionController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    const transaction = await duplicateTransactionService(userId,transactionId)

    return res.send(HTTPSTATUS.OK).json({
      message:"Transaction fetched successfully", 
      transaction
    })
  })

  export const updateTransactionController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);
    const body = updateTransactionSchema.parse(req.body);

    const updatedTransaction = await updateTransactionService(userId,transactionId,body);

    return res.send(HTTPSTATUS.OK).json({
      message:"Transaction updated successfully", 
      updatedTransaction
    })
  })