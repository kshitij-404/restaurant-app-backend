import { Context } from "elysia";
import UserModel from "../models/userModel";

export const getUser = async (c: Context<{ params: { id: string } }>) => {
  const ruserId = c.request.headers.get("userId");
  return UserModel.findById(ruserId);
};
