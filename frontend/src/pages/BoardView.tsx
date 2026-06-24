import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { boardApi, taskApi } from "../api/client";
import type { Board, Task, TaskStatus } from "../types";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: "todo", title: "To Do", color: "#6366f1" },
  { status: "in-progress", title: "In Progress", color: "#f59e0b" },
  { status: "done", title: "Done", color: "#10b981" },
];

export default function BoardView() {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  useEffect(() => {
    if (id) loadBoard(id);
  }, [id]);

  const loadBoard = async (boardId: string) => {
    try {
      const [boardRes, tasksRes] = await Promise.all([
        boardApi.getById(boardId),
        taskApi.getByBoard(boardId),
      ]);
      setBoard(boardRes.data.board);
      setTasks(tasksRes.data.tasks);
    } catch {
      console.error("Failed to load board");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await taskApi.move(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data.task : t))
      );
    } catch {
      console.error("Failed to move task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskApi.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch {
      console.error("Failed to delete task");
    }
  };

  const handleSaveTask = async (taskData: {
    title: string;
    description: string;
    priority: "low" | "med" | "high";
    dueDate: string;
    estimatedEffort: string;
    status: TaskStatus;
  }) => {
    if (!id) return;

    try {
      if (editingTask) {
        const res = await taskApi.update(editingTask._id, taskData);
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? res.data.task : t))
        );
      } else {
        const res = await taskApi.create(id, taskData);
        setTasks((prev) => [res.data.task, ...prev]);
      }
      setShowTaskModal(false);
      setEditingTask(null);
    } catch {
      console.error("Failed to save task");
    }
  };

  const getFilteredTasks = (status: TaskStatus) => {
    let filtered = tasks.filter((t) => t.status === status);

    if (filterPriority !== "all") {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  };

  if (isLoading) {
    return (
      <div className="board-view">
        <div className="board-header skeleton" />
        <div className="board-columns">
          {COLUMNS.map((col) => (
            <div key={col.status} className="column">
              <div className="column-header skeleton" />
              <div className="column-tasks skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="board-view">
        <div className="empty-state">
          <h2>Board not found</h2>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="board-view">
      <div className="board-header">
        <div className="board-header-left">
          <Link to="/dashboard" className="back-link">
            ← Back
          </Link>
          <h1>{board.title}</h1>
          {board.description && <p>{board.description}</p>}
        </div>
        <div className="board-header-right">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="med">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="dueDate">Sort by Due Date</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
            }}
          >
            + Add Task
          </button>
        </div>
      </div>

      <div className="board-columns">
        {COLUMNS.map((col) => {
          const columnTasks = getFilteredTasks(col.status);
          return (
            <div key={col.status} className="column">
              <div
                className="column-header"
                style={{ borderTopColor: col.color }}
              >
                <h2>{col.title}</h2>
                <span className="task-count">{columnTasks.length}</span>
              </div>
              <div className="column-tasks">
                {columnTasks.length === 0 ? (
                  <div className="column-empty">No tasks</div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setShowTaskModal(true);
                      }}
                      onDelete={handleDeleteTask}
                      onMove={handleMoveTask}
                      columns={COLUMNS}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
