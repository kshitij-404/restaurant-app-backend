import mongoose, { Schema, Document } from "mongoose";

// Define the user schema
interface IUser extends Document {
  name: string;
  email: string;
  avatar: string;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
});

// Create and export the user model
const UserModel = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
