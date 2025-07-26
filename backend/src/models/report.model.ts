import mongoose from "mongoose";

export enum ReportStatusEnum {
    SENT="SENT",
    PENDING="PENDING",
    FAILED="FAILED",
}

export interface ReportDocument extends Document {
    userId:mongoose.Types.ObjectId;
    period:string;
    sentDate:Date;
    status:keyof typeof ReportStatusEnum;
    createdAt:Date;
    updatedAt:Date;   
}

const reportSchema = new mongoose.Schema<ReportDocument>({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    period:{type:String,required:true},
    sentDate:{type:Date,required:true},
    status:{
        type:String,
        enum:Object.values(ReportStatusEnum),
        default:ReportStatusEnum.PENDING,
        required:true,
    }
});

const ReportModel = mongoose.model<ReportDocument>("Report",reportSchema);
export default ReportModel;