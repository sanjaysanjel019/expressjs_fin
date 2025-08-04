import { title } from "process";
import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { calculateNextOccurrence } from "../utils/helper";
import { BulkDeleteTransactionType, CreateTransactionType, UpdateTransactionType } from "../validators/transaction.validator";
import { HTTPSTATUS } from "../config/http.config";
import axios, { Axios } from "axios";
import { genAI, genAIModel } from "../config/google-ai.config";
import { createPartFromBase64, createUserContent } from "@google/genai";
import { receiptPrompt } from "../utils/prompt";
import { error } from "console";
export const createTransactionService = async (
  body: CreateTransactionType,
  userId: string
) => {
  let nextRecurringDate: Date | undefined;
  const currentDate = new Date();
  if (body.isRecurring && body.recurringInterval) {
    const calculatedDate = calculateNextOccurrence(
      body.date,
      body.recurringInterval
    );

    nextRecurringDate =
      calculatedDate < currentDate
        ? calculateNextOccurrence(currentDate, body.recurringInterval)
        : calculatedDate;
    console.log("NextRecurringDate", nextRecurringDate);
  }
  const transaction = await TransactionModel.create({
    ...body,
    userId,
    category: body.category,
    amount: Number(body.amount),
    isRecurring: body.isRecurring || false,
    recurringInterval: body.recurringInterval || null,
    nextRecurringDate,
    lastProcessedDate: null,
  });

  return transaction;
};

export const getAllTransactionService = async (
  userId: string,
  filters: {
    keyword?: string;
    type?: keyof typeof TransactionTypeEnum;
    recurringStatus?: "RECURRING" | "NON_RECURRING"| undefined;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const { keyword, type, recurringStatus } = filters;

  const filterConditions: Record<string, any> = {
    userId,
  };

  if (keyword) {
    filterConditions.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  if (type) {
    filterConditions.type = type;
  }

  if (recurringStatus) {
    if (recurringStatus === "RECURRING") {
      filterConditions.isRecurring = true;
    } else if (recurringStatus === "NON_RECURRING") {
      filterConditions.isRecurring = false;
    }
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find(filterConditions)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    TransactionModel.countDocuments(filterConditions),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions,
    pagination: {
      pageSize,
      pageNumber,
      totalPages,
      totalCount,
    },
  };
};

export const getTransactionyByIdService = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if(!transaction){
    throw new NotFoundException("Transaction not found");
  }

  return transaction;
}


export const duplicateTransactionService = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if(!transaction){
    throw new NotFoundException("Transaction not found");
  }
  const duplicated = await TransactionModel.create({
    ...transaction.toObject(),
    _id:undefined,
    title:`Duplicate ${transaction.title}`,
    description:transaction.description ? `${transaction.description}(Duplicate)`:"Duplicated Transaction",
    isRecurring:false,
    recurringInterval:undefined,
    nextRecurringDate:undefined,
    lastProcessedDate:undefined,
    createdAt:undefined,
    updatedAt:undefined,
  })
  return duplicated;

}


export const updateTransactionService = async (
  userId: string,
  transactionId: string,
  body:UpdateTransactionType
) => {
  const existingTransaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if(!existingTransaction){
    throw new NotFoundException("Transaction not found");
  }

  const now = new Date();
  const isRecurring = body.isRecurring || existingTransaction.isRecurring;

  const date = body.date !== undefined ? new Date(body.date): existingTransaction.date;
  const recurringInterval = body.recurringInterval || existingTransaction.recurringInterval;
  let nextRecurringDate:Date | undefined;

  if(isRecurring && recurringInterval){
    const calculatedDate = calculateNextOccurrence(date, recurringInterval);

    nextRecurringDate = calculatedDate < now ? calculateNextOccurrence(now,recurringInterval):calculatedDate;

  }

  existingTransaction.set({
    ...(body.title && {title:body.title}),
    ...(body.description && {title:body.description}),
    ...(body.category && {category:body.category}),
    ...(body.type && {type:body.type}),
    ...(body.paymentMethod && {paymentMethod:body.paymentMethod}),
    ...(body.amount !== undefined && {amount:Number(body.amount)}),
    date,
    isRecurring,
    recurringInterval,
    nextRecurringDate,    
  })

  await existingTransaction.save();

  return existingTransaction;

}

export const deleteTransactionService = async (
  userId: string,
  transactionId: string
) => {
  const deleted = await TransactionModel.findByIdAndDelete({
    _id: transactionId,
    userId,
  });
  if (!deleted) throw new NotFoundException("Transaction not found");

  return;
};

export const bulkDeleteTransactionService = async (
  userId: string,
  transactionIds: string[]
) => {
  const result = await TransactionModel.deleteMany({
    _id:{$in:transactionIds},
    userId,
  });

  if(result.deletedCount == 0){
    throw new NotFoundException("No  transactions found");
  }

  return {
    success:true,
    deletedCount:result.deletedCount,
  }

  
}


export const bulkTransactionService = async(
  userId:string,
  transactions:CreateTransactionType[]
) => {
  try{
    const bulkOps = transactions.map((trns)=>({
      insertOne :{
        document:{
          ...trns,
          userId,
          isRecurring:false,
          nextRecurringDate:null,
          recurringInterval:null,
          lastProcessedDate:null,
          createdAt:new Date(),
          updatedAt:new Date(),
        }
      }
    }))

const result = await TransactionModel.bulkWrite(bulkOps,{
  ordered:true // <-- This will throw an error if any of the operations fail
})

return {
  insertedCount:result.insertedCount,
  success:true,
}

  }catch(error){
   throw error;
  }
}

export const scanReceiptsService = async(
  file:Express.Multer.File | undefined,
) => {
  //TODO: Implement receipt scanning logic
  if(!file){
    throw new BadRequestException("No file uploaded");
  }

  try {

    if (!file.path) {
      throw new BadRequestException("File path is missing");
    }

    const responseData = await axios.get(file?.path, {
      responseType: "arraybuffer",
    });
    const base64Image = Buffer.from(responseData.data).toString("base64");

    if(!base64Image){
      throw new BadRequestException("Image is not base64 encoded");
    }

    const result = await genAI.models.generateContent({
      model:genAIModel,
      contents: [
        createUserContent([
          receiptPrompt,
          createPartFromBase64(base64Image, file.mimetype),
        ])
      ],
      config:{
        temperature:0,
        topP:1,
        responseMimeType:"application/json"
      }
    })

    const response = result.text;
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

    if(!cleanedText){
      return {
        error:"Could not read receipt content"
      }
    }

    const data = JSON.parse(cleanedText);
    if(!data?.amount || !data.date){
      return {
        error:"Receipt missing required information"
      }
    }

    return {
      title:data.title || "Receipt",
      amount:data.amount,
      date:data.date,
      description:data.description,
      category:data.category ,
      type:data.type, 
      paymentMethod:data.paymentMethod ,
      receiptUrl:file.path
    }



  } catch (error) {
    return {
      error:"Receipt Scanning Service currently unavailable"
    }
  }


  return {
    success:true,
    message:"Receipt scanned successfully",
  }
}