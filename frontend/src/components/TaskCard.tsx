import type { Task, TaskStatus } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMove: (taskId: string, status: TaskStatus) => void;
  columns: { status: TaskStatus; title: string }[];
}

const PRIORITY_BADGES: Record<string, { label: string; className: string }> = {
  high: { label: "High", className: "badge-high" },
  med: { label: "Medium", className: "badge-med" },
  low: { label: "Low", className: "badge-low" },
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
  columns,
}: TaskCardProps) {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  const nextStatus = (): TaskStatus | null => {
    const idx = columns.findIndex((c) => c.status === task.status);
    if (idx < columns.length - 1) return columns[idx + 1].status;
    return null;
  };

  const next = nextStatus();

  return (
    <div className={`task-card ${isOverdue ? "overdue" : ""}`}>
      <div className="task-card-header">
        <h3>{task.title}</h3>
        <span className={`badge ${PRIORITY_BADGES[task.priority].className}`}>
          {PRIORITY_BADGES[task.priority].label}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        {task.dueDate && (
          <span className={`task-due ${isOverdue ? "overdue" : ""}`}>
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.estimatedEffort && (
          <span className="task-effort">⏱ {task.estimatedEffort}</span>
        )}
      </div>

      <div className="task-actions">
        {next && (
          <button
            className="btn btn-sm btn-move"
            onClick={() => onMove(task._id, next)}
            title={`Move to ${columns.find((c) => c.status === next)?.title}`}
          >
            →{" "}
            {columns.find((c) => c.status === next)?.title}
          </button>
        )}
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => onEdit(task)}
        >
          Edit
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(task._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
