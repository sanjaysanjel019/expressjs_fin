import UserModel from "../models/user.model";
import { NotFoundException } from "../utils/app-error";
import { UpdateUserType } from "../validators/user.validator";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  return user?.omitPassword();
};

export const updateUserService = async (
  userId: string,
  body: UpdateUserType,
  profilePicture?: Express.Multer.File | null
) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  if (profilePicture) {
    user.profilePicture = profilePicture.path;
  }

  user.set({
    name: body.name,
  });
  await user.save();

  return user?.omitPassword();
};