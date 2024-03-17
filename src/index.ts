import { Elysia } from "elysia";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import menuItemRoutes from "./routes/menuItemRoutes";
import orderRoutes from "./routes/orderRoutes";
import cancelTxnCron from "./utils/cancelTxnCron";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { cors } from "@elysiajs/cors";
import restroRoutes from "./routes/restroRoutes";

dotenv.config();
await mongoose.connect(process.env.MONGO_CONNECTION_STRING || "");

console.log("Connected to MongoDB");

const app = new Elysia();
app.use(cors());

app.get("/", () => "Hello Elysia");

app.use(authRoutes);
app.use(userRoutes);
app.use(menuItemRoutes);
app.use(orderRoutes);
app.use(cancelTxnCron);
app.use(restroRoutes);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
