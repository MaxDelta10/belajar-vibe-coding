import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { db } from "./db/connection";
import { users } from "./db/schema";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: "Belajar Vibe Coding API",
        version: "1.0.0",
        description: "Dokumentasi interaktif untuk sistem backend autentikasi Vibe Coding."
      }
    }
  }))
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
