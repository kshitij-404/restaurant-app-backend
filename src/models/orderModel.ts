import mongoose, { Schema, Document, ObjectId } from 'mongoose';

// Define the user schema
interface IOrder extends Document {
    items: {
        name: string;
        price: number;
        isVeg: boolean;
        quantity: number;
        menuItemRef: string;
    }[];
    id: number;
    status: "received" | "accepted" | "ready" | "delivered";
    placedAt: Date;
    orderedBy: ObjectId;
    paymentStatus: "pending" | "success" | "failed";
    paymentMetadata: any;
    orderMode: 'dinein' | 'takeaway';
}

const OrderSchema: Schema = new Schema({
    items: [{
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
    }],
    id: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    placedAt: {
        type: Date,
        required: true
    },
    orderedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'success', 'failed']
    },
    paymentMetadata: {
        type: Object
    },
    orderMode: {
        type: String,
        required: true,
        enum: ['dinein', 'takeaway']
    }
});

// Create and export the user model
const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
export default OrderModel;