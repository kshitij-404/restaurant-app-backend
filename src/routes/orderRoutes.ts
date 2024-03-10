import { Elysia, t } from "elysia";
import { auth, restro } from "../middleware/auth";
import { createOrder } from "../controllers/orderController";

const orderRoutes = (app: Elysia) => {
    return app.group("/api/v1/order", (app) =>
        app
            .post("/create", createOrder, {
                body: t.Object({
                    items: t.Array(t.Object({
                        name: t.String(),
                        price: t.Number(),
                        isVeg: t.Boolean(),
                        quantity: t.Number(),
                        menuItemRef: t.String()
                    }))
                }),
                type: "json",
                beforeHandle: (c) => auth(c)
            })
    )
}

export default orderRoutes;