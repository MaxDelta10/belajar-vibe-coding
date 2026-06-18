import { Elysia } from "elysia";
import { registerUser, loginUser } from "../services/user-service";

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
  })
  .post("/users/login", async ({ body, set }) => {
    try {
      const token = await loginUser(body as any);
      return { data: token };
    } catch (error) {
      console.log("LOGIN ROUTE ERROR:", error);
      set.status = 401; // Unauthorized
      return { data: "Email atau password salah" };
    }
  });
