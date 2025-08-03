import {v2 as cloudinary} from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
api_key:process.env.CLOUDINARY_API_KEY,
api_secret:process.env.CLOUDINARY_API_SECRET
})

const STORAGE_PARAMS = {
    folder:"fintech-images",
    allowed_formats:["png","jpg","jpeg"],
    resource_type: "image" as const,
    quality : "auto:good" as const
}

const storage = new CloudinaryStorage({
cloudinary:cloudinary,
params:(req,file)=>({
    ... STORAGE_PARAMS
})
    
})

export const upload = multer({
    storage,
    limits:{fileSize:2*1024*1024, files:1},
    fileFilter:(_,file,cb) => {
        const inValid = /^images\/(jpe?g|png)$/.test(file.mimetype);
        if(inValid){
            return;
        }
    }
})