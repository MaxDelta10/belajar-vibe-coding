import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/user-service";

export const usersRoute = new Elysia({ prefix: "/api" })
  .derive(({ headers }) => {
    let token = headers["authorization"];
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
    return { token };
  })
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
  }, {
    body: t.Object({
      name: t.String({ maxLength: 100 }),
      email: t.String({ format: "email", maxLength: 255 }),
      password: t.String({ minLength: 6, maxLength: 255 })
    }),
    response: {
      200: t.Object({
        data: t.String()
      }),
      400: t.Object({
        data: t.String()
      })
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
  }, {
    body: t.Object({
      email: t.String({ format: "email", maxLength: 255 }),
      password: t.String({ minLength: 6, maxLength: 255 })
    }),
    response: {
      200: t.Object({
        data: t.String()
      }),
      401: t.Object({
        data: t.String()
      })
    }
  })
  .post("/users/current-user", async ({ token, set }) => {
    try {
      const user = await getCurrentUser(token);
      return { data: user };
    } catch (error) {
      console.log("CURRENT USER ROUTE ERROR:", error);
      set.status = 401;
      return { data: "Unauthorized" };
    }
  }, {
    headers: t.Object({
      authorization: t.Optional(t.String({ description: "Bearer <token>" }))
    }),
    response: {
      200: t.Object({
        data: t.Object({
          token: t.String(),
          name: t.String(),
          email: t.String(),
          created_at: t.Any()
        })
      }),
      401: t.Object({
        data: t.String()
      })
    }
  })
  .delete("/users/logout", async ({ token, set }) => {
    try {
      await logoutUser(token);
      return { data: "OK" };
    } catch (error) {
      console.log("LOGOUT ROUTE ERROR:", error);
      set.status = 401;
      return { data: "Unauthorized" };
    }
  }, {
    headers: t.Object({
      authorization: t.Optional(t.String({ description: "Bearer <token>" }))
    }),
    response: {
      200: t.Object({
        data: t.String()
      }),
      401: t.Object({
        data: t.String()
      })
    }
  });
