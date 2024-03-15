import { Context } from "elysia";
import OrderModel from "../models/orderModel";
import MenuItemModel from "../models/menuItemModel";
import RestaurantModel from "../models/restaurantModel";
import mongoose from "mongoose";
import ky from "ky";

export const createOrder = async (
    c: Context<{ body: { items: { quantity: number; menuItemRef: string }[] } }>
) => {
    if (!c.body) throw new Error("No body provided");

    const { items } = c.body;

    try {
        const detailedItems = await Promise.all(
            items.map(async ({ quantity, menuItemRef }) => {
                const menuItem = await MenuItemModel.findById(menuItemRef);
                if (!menuItem) {
                    c.set.status = 400;
                    throw new Error("Invalid menu item");
                }

                if (menuItem.isAvailable === false) {
                    c.set.status = 400;
                    throw new Error("Menu item not available");
                }

                const restaurant = await RestaurantModel.findById(menuItem.restaurant);

                if (!restaurant) {
                    c.set.status = 400;
                    throw new Error("Invalid restaurant");
                }

                if (restaurant.isOpen === false) {
                    c.set.status = 400;
                    throw new Error("Restaurant not open");
                }

                return {
                    name: menuItem.name,
                    price: menuItem.price,
                    isVeg: menuItem.isVeg,
                    quantity,
                    menuItemRef,
                };
            })
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const highestOrder = await OrderModel.find({
            placedAt: { $gte: today, $lt: tomorrow },
        })
            .sort({ id: -1 })
            .limit(1);

        const newId = highestOrder.length > 0 ? highestOrder[0].id + 1 : 1;

        const orderedBy = c.request.headers.get("userId");

        const order = new OrderModel({
            items: detailedItems,
            id: newId,
            placedAt: new Date(),
            status: "recieved",
            orderedBy: orderedBy,
            paymentStatus: "pending",
        });

        const newOrder = await order.save();

        if (!newOrder) {
            c.set.status = 500;
            throw new Error("Failed to create new order");
        }

        const user = JSON.parse(c.request.headers.get("user") || "{}");

        const paymentData = {
            key: process.env.UPI_SECRET_KEY,
            client_txn_id: newOrder._id,
            amount: detailedItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(1),
            p_info: detailedItems.map(item => `${item.quantity} x ${item.name}`).join(", "),
            customer_name: user.name,
            customer_email: user.email,
            customer_mobile: "0000000000",
            redirect_url: "http://google.com"
        };

        // const createOrderFetch = edenFetch<App>('https://api.ekqr.in/api/');

        // const payment = await createOrderFetch('/', {
        //     method: 'POST',
        //     body: paymentData,
        // }
        // );

        const payment = await ky.post('https://api.ekqr.in/api/create_order', {
            json: paymentData
        }).json();

        if (!payment) {
            await OrderModel
                .findByIdAndUpdate(newOrder._id, { status: "failed" })
                .exec();

            c.set.status = 400;
            throw new Error("Failed to create payment link");
        }

        const paymentMetadata = payment;

        await OrderModel
            .findByIdAndUpdate(newOrder._id, { paymentMetadata })
            .exec();

        // @ts-ignore    
        if (payment.status !== true) {
            await OrderModel
                .findByIdAndUpdate(newOrder._id, { status: "failed" })
                .exec();

            c.set.status = 400;
            throw new Error("Failed to create payment link");
        }

        return {
            status: c.set.status,
            success: true,
            data: {
                order: newOrder,
                // @ts-ignore 
                paymentLink: paymentMetadata.data.payment_url,
            },
            message: "Order created successfully",
        };
    } catch (error) {
        console.log(error);
        c.set.status = 500;
        throw new Error("Failed to create order");
    }
};

export const getAllUserOrders = async (c: Context) => {
    try {
        const userId = c.request.headers.get("userId");
        if (!userId) {
            c.set.status = 400;
            throw new Error("Invalid user");
        }

        const orders = await OrderModel.find({
            orderedBy: new mongoose.Types.ObjectId(userId),
        });

        return {
            status: c.set.status,
            success: true,
            data: orders,
            message: "Orders fetched successfully",
        };
    } catch (error) {
        c.set.status = 500;
        console.log(error);
        throw new Error("Failed to fetch orders");
    }
};

export const getAllOrders = async (c: Context<{ query: { status: "recieved" | "accepted" | "ready" | "delivered" } }>) => {
    try {
        const orders = await OrderModel.find({ paymentStatus: "success", status: c.query?.status });

        return {
            status: c.set.status,
            success: true,
            data: orders,
            message: "Orders fetched successfully",
        };
    } catch (error) {
        console.log(error);
        c.set.status = 500;
        throw new Error("Failed to fetch orders");
    }
};

export const updateOrderStatus = async (
    c: Context<{
        params: { id: string };
        body: { status: "recieved" | "accepted" | "ready" | "delivered" };
    }>
) => {
    if (!c.params) throw new Error("No params provided");
    if (!c.body) throw new Error("No body provided");

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
            message: "Order status updated successfully",
        };
    } catch (error) {
        c.set.status = 500;
        throw new Error("Failed to update order status");
    }
};

export const orderWebhook = async (c: Context) => {
    try {
        console.log(c.body);
        console.log(c.request.body)

        if (!c.body) throw new Error("No body provided");

        // @ts-ignore
        if (c.body.status !== "success") {
            await OrderModel
                // @ts-ignore
                .findByIdAndUpdate(new mongoose.Types.ObjectId(c.body.client_txn_id), { paymentStatus: "failed" })
                .exec();

            return {
                status: c.set.status,
                success: false,
                message: "Payment failed",
            }
        }

        await OrderModel
            // @ts-ignore
            .findByIdAndUpdate(new mongoose.Types.ObjectId(c.body.client_txn_id), { paymentStatus: "success" })
            .exec();

        return {
            status: c.set.status,
            success: true,
            data: c.body,
            message: "Payment successful",
        };
    } catch (error) {
        console.log(error)
        c.set.status = 500;
        throw new Error("Failed to process payment");
    }
}