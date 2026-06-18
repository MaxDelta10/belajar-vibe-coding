import { Elysia } from "elysia";
import { db } from "./db/connection";
import { users } from "./db/schema";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .get("/", () => "Hello World")
  .use(usersRoute)
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
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
