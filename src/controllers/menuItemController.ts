import { Context } from "elysia";
import MenuItemModel from "../models/menuItemModel";
import mongoose from "mongoose";
import RestaurantModel from "../models/restaurantModel";

export const getMenuItem = async (c: Context<{ params: { id: string } }>) => {
  if (c.params && !c.params?.id) {
    c.set.status = 400;
    throw new Error("No restaurant name provided");
  }

  const id = c.params.id;

  try {
    const menuItemsPromise = MenuItemModel.find({ restaurant: id })
      .lean()
      .exec();
    console.log("restro id", id);
    const restroPromise = RestaurantModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    })
      .lean()
      .exec();
    const [menuItems, restro] = await Promise.all([
      menuItemsPromise,
      restroPromise,
    ]);
    c.set.status = 200;
    return {
      menu: menuItems,
      restaurant: restro,
    };
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

export const updateCategoryStatus = async (
  c: Context<{ params: { category: string }; body: { isAvailable: boolean } }>
) => {
  if (!c.params?.category) {
    c.set.status = 400;
    throw new Error("No Category Name provided");
  }

  if (!c.body) {
    c.set.status = 400;
    throw new Error("No body provided");
  }

  const { category } = c.params;
  const { isAvailable } = c.body;

  try {
    const menuItem = await MenuItemModel.find({ category })
      .lean()
      .exec();

    if (menuItem.length === 0) {
      c.set.status = 404;
      throw new Error("Category not found");
    }

    await MenuItemModel.updateMany({ category }, { isAvailable });

    return {
      status: c.set.status,
      success: true,
      message: "Menu Category status updated successfully",
    };
  } catch (error) {
    c.set.status = 500;
    throw new Error("Failed to update menu category status");
  }
};
