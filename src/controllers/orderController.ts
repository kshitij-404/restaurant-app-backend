import { Context } from "elysia";
import OrderModel from "../models/orderModel";

export const createOrder = async (c: Context<{ body: { items: object[] }}>) => {
    if (!c.body) throw new Error('No body provided')

    const { items } = c.body;

    try {
        const order = new OrderModel({ items });
        const newOrder = await order.save();

        if (!newOrder) {
            c.set.status = 500;
            throw new Error("Failed to create order");
        }

        return {
            status: c.set.status,
            success: true,
            data: newOrder,
            message: "Order created successfully"
        }
    } catch (error) {
        c.set.status = 500;
        throw new Error("Failed to create order");
    }
}