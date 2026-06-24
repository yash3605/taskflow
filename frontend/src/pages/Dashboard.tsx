import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { boardApi } from "../api/client";
import type { Board } from "../types";

export default function Dashboard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const res = await boardApi.getAll();
      setBoards(res.data.boards);
    } catch {
      console.error("Failed to load boards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const res = await boardApi.create({
        title: newTitle.trim(),
        description: newDescription.trim(),
      });
      setBoards((prev) => [res.data.board, ...prev]);
      setNewTitle("");
      setNewDescription("");
      setShowCreate(false);
    } catch {
      console.error("Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete board "${title}"? This will also delete all tasks.`))
      return;

    try {
      await boardApi.delete(id);
      setBoards((prev) => prev.filter((b) => b._id !== id));
    } catch {
      console.error("Failed to delete board");
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="board-card skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Boards</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
        >
          + New Board
        </button>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Board</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="boardTitle">Title</label>
                <input
                  id="boardTitle"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="My Project Board"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="boardDesc">Description (optional)</label>
                <textarea
                  id="boardDesc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What's this board about?"
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreating || !newTitle.trim()}
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {boards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No boards yet</h2>
          <p>Create your first board to start organizing tasks.</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + Create Board
          </button>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map((board) => (
            <div key={board._id} className="board-card">
              <Link to={`/board/${board._id}`} className="board-card-link">
                <h3>{board.title}</h3>
                {board.description && <p>{board.description}</p>}
                <span className="board-date">
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </span>
              </Link>
              <button
                className="btn-icon btn-delete"
                onClick={() => handleDelete(board._id, board.title)}
                title="Delete board"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
