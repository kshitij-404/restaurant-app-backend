import { Context } from "elysia";
import OrderModel from "../models/orderModel";
import MenuItemModel from "../models/menuItemModel";

export const createOrder = async (c: Context<{ body: { items: { quantity: number, menuItemRef: string }[] } }>) => {
    if (!c.body) throw new Error('No body provided')

    const { items } = c.body;

    try {
        const detailedItems = await Promise.all(items.map(async ({ quantity, menuItemRef }) => {
            const menuItem = await MenuItemModel.findById(menuItemRef);
            if (!menuItem) {
                c.set.status = 400;
                throw new Error("Invalid menu item");
            }

            return {
                name: menuItem.name,
                price: menuItem.price,
                isVeg: menuItem.isVeg,
                quantity,
                menuItemRef
            }
        }))

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const highestOrder = await OrderModel
            .find({ placedAt: { $gte: today, $lt: tomorrow } })
            .sort({ id: -1 })
            .limit(1);

        const newId = highestOrder.length > 0 ? highestOrder[0].id + 1 : 1;

        const order = new OrderModel({ items: detailedItems, id: newId, placedAt: new Date(), status: "recieved" });

        const newOrder = await order.save();

        if (!newOrder) {
            c.set.status = 500;
            throw new Error("Failed to create new order");
        }

        return {
            status: c.set.status,
            success: true,
            data: newOrder,
            message: "Order created successfully"
        }
    } catch (error) {
        console.log(error)
        c.set.status = 500;
        throw new Error("Failed to create order");
    }
}

export const getAllOrders = async (c: Context) => {
    try {
        const orders = await OrderModel.find();

        return {
            status: c.set.status,
            success: true,
            data: orders,
            message: "Orders fetched successfully"
        }
    } catch (error) {
        c.set.status = 500;
        throw new Error("Failed to fetch orders");
    }
}

export const updateOrderStatus = async (c: Context<{ params: { id: string }, body: { status: "recieved" | "accepted" | "ready" | "delivered" } }>) => {
    if (!c.params) throw new Error('No params provided')
    if (!c.body) throw new Error('No body provided')

    const { id } = c.params;
    const { status } = c.body;

    try {
        const order = await OrderModel.findById(id);

        if (!order) {
            c.set.status = 400;
            throw new Error("Invalid order");
        }

        order.status = status;

        const updatedOrder = await order.save();

        if (!updatedOrder) {
            c.set.status = 500;
            throw new Error("Failed to update order status");
        }

        return {
            status: c.set.status,
            success: true,
            data: updatedOrder,
            message: "Order status updated successfully"
        }
    } catch (error) {
        c.set.status = 500;
        throw new Error("Failed to update order status");
    }
}