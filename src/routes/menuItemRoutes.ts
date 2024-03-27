import { Elysia } from "elysia";
import {
  getMenuItem,
  getMenuItemsForRestro,
  updateCategoryStatus,
  updateMenuItemStatus,
} from "../controllers/menuItemController";
import { auth, restro } from "../middleware/auth";

const menuItemRoutes = (app: Elysia) => {
  return app.group("/api/v1/menu", (app) =>
    app
      .get("/restro", getMenuItemsForRestro, {
        beforeHandle: (c) => restro(c),
      })
      .get("/:id", getMenuItem, {
        beforeHandle: (c) => auth(c),
      })
      .put("/update-category-status/:category", updateCategoryStatus, {
        beforeHandle: (c) => restro(c),
      })
      .put("/update-status/:id", updateMenuItemStatus, {
        beforeHandle: (c) => restro(c),
      })
  );
};

export default menuItemRoutes;
