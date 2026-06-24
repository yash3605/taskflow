import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import authRoutes from "../src/routes/auth.routes";
import { errorHandler } from "../src/middleware/error.middleware";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

describe("Auth Endpoints", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should not register with invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, email: "invalid-email" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should not register with short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, password: "123" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should not register with duplicate email", async () => {
      await request(app).post("/api/auth/register").send(testUser);

      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("already in use");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeAll(async () => {
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe(testUser.email);
    });

    it("should not login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain("Invalid");
    });

    it("should not login with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain("Invalid");
    });
  });

  describe("GET /api/auth/me", () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);
      token = res.body.token;
    });

    it("should return user data with valid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.email).toBe(testUser.email);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalidtoken");

      expect(res.status).toBe(401);
    });
  });
});
