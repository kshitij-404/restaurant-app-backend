import { Elysia, t } from "elysia";
import { auth } from "../middleware/auth";
import { getUser } from "../controllers/userController";

const userRoutes = (app: Elysia) => {
  return app.group("/api/v1/user", (app) =>
    app.get("/", getUser, {
      beforeHandle: (c) => auth(c),
    })
  );
};

export default userRoutes;
