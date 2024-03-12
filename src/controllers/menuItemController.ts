import { Context } from "elysia";
import MenuItemModel from "../models/menuItemModel";
import mongoose from "mongoose";

export const getMenuItem = async (c: Context<{ params: { id: string } }>) => {
  if (c.params && !c.params?.id) {
    c.set.status = 400;
    throw new Error("No restaurant name provided");
  }

  const id = c.params.id;

  try {
    const menuItems = await MenuItemModel.find({ restaurant: id })
      .lean()
      .exec();
    c.set.status = 200;
    return menuItems;
  } catch (error) {
    c.set.status = 500;
    throw new Error("Failed to fetch menu items");
  }
};

export const getMenuItemsForRestro = async (
  c: Context<{ params: { id: string } }>
) => {
  const id = c.request.headers.get("restro");

  try {
    const menuItems = await MenuItemModel.find({ restaurant: id })
      .lean()
      .exec();
    c.set.status = 200;
    return menuItems;
  } catch (error) {
    c.set.status = 500;
    throw new Error("Failed to fetch menu items");
  }
};

export const updateMenuItemStatus = async (
  c: Context<{ params: { id: string }; body: { isAvailable: boolean } }>
) => {
  if (c.params && !c.params?.id) {
    c.set.status = 400;
    throw new Error("No menu item id provided");
  }

  if (!c.body) throw new Error("No body provided");

  const id = c.params.id;
  const { isAvailable } = c.body;

  try {
    const menuItem = await MenuItemModel.findById(id);
    if (!menuItem) {
      c.set.status = 404;
      throw new Error("Menu item not found");
    }
    menuItem.isAvailable = isAvailable;
    const updatedMenuItem = await menuItem.save();

    if (!updatedMenuItem) {
      c.set.status = 500;
      throw new Error("Failed to update menu item status");
    }

    return {
      status: c.set.status,
      success: true,
      data: updatedMenuItem,
      message: "Menu item status updated successfully",
    };
  } catch (error) {
    c.set.status = 500;
    throw new Error("Failed to update menu item status");
  }
};
