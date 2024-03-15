import { Context } from "elysia";
import UserModel from "../models/userModel";
import RestaurantModel from "../models/restaurantModel";
import { jwt } from "../utils/jwt";

export const auth: any = async (c: Context) => {
  let token;
  if (c.headers.authorization && c.headers.authorization.startsWith("Bearer")) {
    try {
      token = c.headers.authorization.split(" ")[1];
      const decoded = await jwt.verify(token);
      const user = await UserModel.findById(decoded.userId).lean().exec();

      c.request.headers.set("userId", user?._id.toString());
      c.request.headers.set("user", JSON.stringify(user));
    } catch (error) {
      c.set.status = 401;
      throw new Error("Not authorized, invalid token");
    }
  }

  if (!token) {
    c.set.status = 401;
    throw new Error("Not authorized, no token");
  }
};

export const restro: any = async (c: Context) => {
  let token;
  if (c.headers.authorization && c.headers.authorization.startsWith("Bearer")) {
    try {
      token = c.headers.authorization.split(" ")[1];
      const decoded = await jwt.verify(token);
      const restro = await RestaurantModel.findById(decoded.id).lean().exec();

      c.request.headers.set("restro", restro?._id.toString());
    } catch (error) {
      c.set.status = 401;
      throw new Error("Not authorized, invalid restaurant");
    }
  }

  if (!token) {
    c.set.status = 401;
    throw new Error("Not authorized, no token");
  }
};
