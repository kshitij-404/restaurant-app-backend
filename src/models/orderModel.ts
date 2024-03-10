import mongoose, { Schema, Document } from 'mongoose';

// Define the user schema
interface IOrder extends Document {
    items: {
        name: string;
        price: number;
        isVeg: boolean;
        quantity: number;
        menuItemRef: string;
    };
    id: number;
    status: "recieved" | "accepted" | "ready" | "delivered";
}

const OrderSchema: Schema = new Schema({
    items: {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        isVeg: {
            type: Boolean,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        menuItemRef: {
            type: String,
            ref: 'MenuItem',
            required: true
        }
    },
    id: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

// Create and export the user model
const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
export default OrderModel;