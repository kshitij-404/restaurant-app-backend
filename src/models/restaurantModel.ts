import mongoose, { Schema, Document } from 'mongoose';

// Define the user schema
interface IRestaurant extends Document {
    name: string;
    phone: string;
    isOpen: boolean;
}

const RestaurantSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isOpen: {
        type: Boolean,
        required: true
    }
});

// Create and export the user model
const RestaurantModel = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
export default RestaurantModel;