import { Elysia, t } from "elysia";
import { auth, restro } from "../middleware/auth";
import {
  getMenuItem,
  getMenuItemsForRestro,
  updateMenuItemStatus,
} from "../controllers/menuItemController";

const menuItemRoutes = (app: Elysia) => {
  return app.group("/api/v1/menu", (app) =>
    app
      .get("/restro", getMenuItemsForRestro, {
        beforeHandle: (c) => restro(c),
      })
      .get("/:id", getMenuItem, {
        beforeHandle: (c) => auth(c),
      })
      .put("/update-status/:id", updateMenuItemStatus, {
        beforeHandle: (c) => restro(c),
      })
  );
};

export default menuItemRoutes;
