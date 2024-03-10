import { Elysia, t } from "elysia";
import {
    authGoogleCallback,
} from "../controllers/authController";

const authRoutes = (app: Elysia) => {
    return app.group("/api/v1/auth", (app) =>
        app
            .get("/google/callback", authGoogleCallback)
    )
}

export default authRoutes;