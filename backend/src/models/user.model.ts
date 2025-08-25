import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *           example: 60d0fe4f5311236168a109ca
 *         name:
 *           type: string
 *           description: The user's full name
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *           example: john.doe@example.com
 *         age:
 *           type: number
 *           description: The user's age
 *           minimum: 0
 *           maximum: 150
 *           example: 30
 *         isActive:
 *           type: boolean
 *           description: Whether the user is active
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: User last update timestamp
 *     UserInput:
 *       type: object
 *       required:
 *         - email
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The user's full name
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *           example: john.doe@example.com
 *         age:
 *           type: number
 *           description: The user's age
 *           minimum: 0
 *           maximum: 150
 *           example: 30
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Error message
 *         errors:
 *           type: array
 *           items:
 *             type: object
 */

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword: () => Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      select: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.comparePassword = async function (password: string) {
  return compareValue(password, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;