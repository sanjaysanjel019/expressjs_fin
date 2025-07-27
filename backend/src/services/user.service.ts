import UserModel from "../models/user.model";
import { NotFoundException } from "../utils/app-error";

export const findByIdUserService = async(userId:string) => {
    const user = await UserModel.findById(userId);
    if(!user){
        throw new NotFoundException("User not found");
    }

    return user?.omitPassword();
}