import mongoose, { Schema, Document } from "mongoose";

// Define the user schema
interface IMenuItem extends Document {
  name: string;
  restaurant: string;
  price: number;
  isAvailable: boolean;
  category: string;
  isVeg: boolean;
  photo: string;
}

const MenuItemSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  isVeg: {
    type: Boolean,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
});

// Create and export the user model
const MenuItemModel = mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
export default MenuItemModel;
