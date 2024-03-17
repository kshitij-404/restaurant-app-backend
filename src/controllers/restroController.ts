import { Context } from "elysia";
import mongoose from "mongoose";
import RestaurantModel from "../models/restaurantModel";

export const getRestroDetails = async (
  c: Context<{ params: { id: string } }>
) => {
  const id = c.request.headers.get("restro");

  if (!id) {
    c.set.status = 400;
    throw new Error("No restaurant id provided");
  }

  try {
    const restroPromise = RestaurantModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    })
      .lean()
      .exec();
    c.set.status = 200;
    return await restroPromise;
  } catch (error) {
    c.set.status = 500;
    throw new Error("Failed to fetch restaurant details");
  }
};

export const updateStatus = async (
  c: Context<{ body: { isOpen: boolean } }>
) => {
  const id = c.request.headers.get("restro");

  if (!id) {
    c.set.status = 400;
    throw new Error("No restaurant id provided");
  }

  try {
    const restroItem = await RestaurantModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { isOpen: c.body.isOpen },
      { new: true }
    ).exec();

    if (!restroItem) {
      c.set.status = 500;
      throw new Error("Failed to update restaurant status");
    }

    return {
      status: c.set.status,
      success: true,
      data: restroItem,
      message: "Restaurant status updated successfully",
    };
  } catch (error) {
    c.set.status = 500;
    throw new Error("Failed to update restaurant status");
  }
};
