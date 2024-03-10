import { Context } from "elysia";
import UserModel from "../models/userModel";

export const getUser = async (c: Context<{ params: {id: string}}>) => {
    if (c.params && !c.params?.id) {
        c.set.status = 400
        throw new Error("No user id provided")
    }

    return UserModel.findById(c.params.id)
}