import { describe, it, expect, beforeEach } from "bun:test";
import { db } from "../src/db/connection";
import { users, sessions } from "../src/db/schema";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";

const app = new Elysia().use(usersRoute);

beforeEach(async () => {
  // Clear tables before each test for consistency
  await db.delete(sessions);
  await db.delete(users);
});

describe("User API Tests", () => {
  describe("POST /api/users (Registration)", () => {
    it("should successfully register a user with valid data", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ data: "OK" });
    });

    it("should fail when registering with a duplicate email", async () => {
      // First registration
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      // Second registration with same email
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Jane Doe",
            email: "john@example.com",
            password: "password456",
          }),
        })
      );
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json).toEqual({ data: "Error" });
    });

    it("should fail when payload is missing required fields", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should fail when name is too long (> 100 chars)", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "a".repeat(101),
            email: "test@example.com",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should fail when email format is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "invalid-email",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should fail when password is too short (< 6 chars)", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "12345",
          }),
        })
      );
      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/users/login (Login)", () => {
    beforeEach(async () => {
      // Seed a user
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
    });

    it("should successfully login with valid credentials", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(typeof json.data).toBe("string");
    });

    it("should fail to login with non-existent email", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "nonexistent@example.com",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ data: "Email atau password salah" });
    });

    it("should fail to login with wrong password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "wrongpassword",
          }),
        })
      );
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ data: "Email atau password salah" });
    });

    it("should fail to login with missing fields", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
          }),
        })
      );
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ data: "Email atau password salah" });
    });
  });

  describe("POST /api/users/current-user (Get Current User)", () => {
    let token: string;

    beforeEach(async () => {
      // Register
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      // Login to get token
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      const json = await response.json();
      token = json.data;
    });

    it("should successfully retrieve profile with a valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current-user", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      );
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.name).toBe("John Doe");
      expect(json.data.email).toBe("john@example.com");
    });

    it("should fail when authorization header is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current-user", {
          method: "POST",
        })
      );
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ data: "Unauthorized" });
    });

    it("should fail when token is invalid/not matching in DB", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current-user", {
          method: "POST",
          headers: {
            "Authorization": "Bearer invalid-token-value",
          },
        })
      );
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ data: "Unauthorized" });
    });
  });

  describe("DELETE /api/users/logout (Logout)", () => {
    let token: string;

    beforeEach(async () => {
      // Register
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      // Login
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      const json = await response.json();
      token = json.data;
    });

    it("should successfully logout with a valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      );
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ data: "OK" });

      // Verify token cannot be used anymore
      const profileResponse = await app.handle(
        new Request("http://localhost/api/users/current-user", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      );
      expect(profileResponse.status).toBe(401);
    });

    it("should be idempotent and succeed when logging out twice", async () => {
      // First logout
      const response1 = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      );
      expect(response1.status).toBe(200);

      // Second logout (idempotent check)
      const response2 = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      );
      expect(response2.status).toBe(200);
      const json = await response2.json();
      expect(json).toEqual({ data: "OK" });
    });

    it("should fail when authorization header is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
        })
      );
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ data: "Unauthorized" });
    });
  });
});
