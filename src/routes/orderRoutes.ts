import { Elysia, t } from "elysia";
import { auth, restro } from "../middleware/auth";
import { createOrder, getAllOrders, updateOrderStatus } from "../controllers/orderController";

const orderRoutes = (app: Elysia) => {
    return app.group("/api/v1/order", (app) =>
        app
            .post("/create", createOrder, {
                body: t.Object({
                    items: t.Array(t.Object({
                        quantity: t.Number(),
                        menuItemRef: t.String()
                    }))
                }),
                type: "json",
                beforeHandle: (c) => auth(c)
            })

            .get("/all", getAllOrders, {
                beforeHandle: (c) => restro(c)
            })

            .put("/update-status/:id", updateOrderStatus, {
                beforeHandle: (c) => restro(c)
            })
    )
}

export default orderRoutes;