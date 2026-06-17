import { Elysia } from "elysia";
import { db } from "./db/connection";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => "Hello World")
  .get("/users", async () => {
    try {
      return await db.select().from(users);
    } catch (error: any) {
      return { 
        error: "Database connection error or table not found",
        details: error?.message || String(error)
      };
    }
  })
  .post("/users", async ({ body }) => {
    const { name, email } = body as { name: string; email: string };
    if (!name || !email) {
      return { error: "Name and email are required" };
    }
    try {
      const result = await db.insert(users).values({ name, email });
      return { success: true, result };
    } catch (error: any) {
      return { 
        error: "Failed to insert user",
        details: error?.message || String(error)
      };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
