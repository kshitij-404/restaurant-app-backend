import { Elysia } from "elysia";
import {
  getRestroDetails,
  updateStatus,
} from "../controllers/restroController";
import { restro } from "../middleware/auth";

const restroRoutes = (app: Elysia) => {
  return app.group("/api/v1/restaurant", (app) =>
    app
      .get("/", getRestroDetails, {
        beforeHandle: restro,
      })
      .put("/status", updateStatus, {
        beforeHandle: (c) => restro(c),
      })
  );
};

export default restroRoutes;
