import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import boardRoutes from "../src/routes/board.routes";
import authRoutes from "../src/routes/auth.routes";
import { errorHandler } from "../src/middleware/error.middleware";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use(errorHandler);

describe("Board Endpoints", () => {
  let token: string;
  const testUser = {
    name: "Board Test User",
    email: "boardtest@example.com",
    password: "password123",
  };

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    token = res.body.token;
  });

  describe("POST /api/boards", () => {
    it("should create a new board", async () => {
      const res = await request(app)
        .post("/api/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Test Board", description: "Test Description" });

      expect(res.status).toBe(201);
      expect(res.body.board.title).toBe("Test Board");
      expect(res.body.board.description).toBe("Test Description");
    });

    it("should not create board without title", async () => {
      const res = await request(app)
        .post("/api/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "No title" });

      expect(res.status).toBe(400);
    });

    it("should not create board without auth", async () => {
      const res = await request(app)
        .post("/api/boards")
        .send({ title: "No Auth Board" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/boards", () => {
    it("should return user boards", async () => {
      await request(app)
        .post("/api/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Board 1" });

      await request(app)
        .post("/api/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Board 2" });

      const res = await request(app)
        .get("/api/boards")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.boards).toHaveLength(2);
    });
  });

  describe("PUT /api/boards/:id", () => {
    it("should update a board", async () => {
      const createRes = await request(app)
        .post("/api/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Original Title" });

      const boardId = createRes.body.board._id;

      const res = await request(app)
        .put(`/api/boards/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated Title" });

      expect(res.status).toBe(200);
      expect(res.body.board.title).toBe("Updated Title");
    });
  });

  describe("DELETE /api/boards/:id", () => {
    it("should delete a board", async () => {
      const createRes = await request(app)
        .post("/api/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "To Delete" });

      const boardId = createRes.body.board._id;

      const res = await request(app)
        .delete(`/api/boards/${boardId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);

      const getRes = await request(app)
        .get(`/api/boards/${boardId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe("Ownership enforcement", () => {
    it("should not allow accessing other user's boards", async () => {
      const createRes = await request(app)
        .post("/api/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "My Board" });

      const boardId = createRes.body.board._id;

      const otherUserRes = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Other User",
          email: "other@example.com",
          password: "password123",
        });

      const otherToken = otherUserRes.body.token;

      const res = await request(app)
        .get(`/api/boards/${boardId}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
    });
  });
});
