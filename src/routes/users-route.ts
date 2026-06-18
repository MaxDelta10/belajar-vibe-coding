import { Elysia } from "elysia";
import { registerUser } from "../services/user-service";

export const usersRoute = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    try {
      await registerUser(body as any);
      return { data: "OK" };
    } catch (error) {
      console.log("ROUTE ERROR:", error);
      // In case of error (validation failure, email duplicate, database issues)
      set.status = 400;
      return { data: "Error" };
    }
  });
