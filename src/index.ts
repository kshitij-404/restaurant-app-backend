import { Elysia } from "elysia";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import menuItemRoutes from "./routes/menuItemRoutes";
import orderRoutes from "./routes/orderRoutes";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Ensure a default empty string if undefined

await mongoose.connect(process.env.MONGO_CONNECTION_STRING || "")

console.log("Connected to MongoDB");

const app = new Elysia()

app.get("/", () => "Hello Elysia");

app.use(authRoutes);
app.use(userRoutes);
app.use(menuItemRoutes);
app.use(orderRoutes);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
