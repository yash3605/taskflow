import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import taskRoutes from "../src/routes/task.routes";
import boardRoutes from "../src/routes/board.routes";
import authRoutes from "../src/routes/auth.routes";
import { errorHandler } from "../src/middleware/error.middleware";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);
app.use(errorHandler);

describe("Task Endpoints", () => {
  let token: string;
  let boardId: string;

  const testUser = {
    name: "Task Test User",
    email: "tasktest@example.com",
    password: "password123",
  };

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    token = res.body.token;

    const boardRes = await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Board" });
    boardId = boardRes.body.board._id;
  });

  describe("POST /api/tasks/board/:boardId", () => {
    it("should create a new task", async () => {
      const res = await request(app)
        .post(`/api/tasks/board/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Task",
          description: "Test Description",
          priority: "high",
        });

      expect(res.status).toBe(201);
      expect(res.body.task.title).toBe("Test Task");
      expect(res.body.task.priority).toBe("high");
      expect(res.body.task.status).toBe("todo");
    });

    it("should not create task without title", async () => {
      const res = await request(app)
        .post(`/api/tasks/board/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "No title" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/tasks/board/:boardId", () => {
    it("should return tasks for a board", async () => {
      await request(app)
        .post(`/api/tasks/board/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Task 1" });

      await request(app)
        .post(`/api/tasks/board/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Task 2" });

      const res = await request(app)
        .get(`/api/tasks/board/${boardId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(2);
    });
  });

  describe("PATCH /api/tasks/:id/move", () => {
    it("should move task to different status", async () => {
      const createRes = await request(app)
        .post(`/api/tasks/board/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Move Test" });

      const taskId = createRes.body.task._id;

      const res = await request(app)
        .patch(`/api/tasks/${taskId}/move`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "in-progress" });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe("in-progress");
    });

    it("should not move to invalid status", async () => {
      const createRes = await request(app)
        .post(`/api/tasks/board/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Invalid Status Test" });

      const taskId = createRes.body.task._id;

      const res = await request(app)
        .patch(`/api/tasks/${taskId}/move`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "invalid" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      const createRes = await request(app)
        .post(`/api/tasks/board/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "To Delete" });

      const taskId = createRes.body.task._id;

      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });
  });

  describe("Ownership enforcement", () => {
    it("should not allow accessing other user's tasks", async () => {
      const createRes = await request(app)
        .post(`/api/tasks/board/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "My Task" });

      const taskId = createRes.body.task._id;

      const otherUserRes = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Other User",
          email: "other@example.com",
          password: "password123",
        });

      const otherToken = otherUserRes.body.token;

      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
    });
  });
});
