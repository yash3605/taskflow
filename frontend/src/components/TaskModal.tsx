import { useState, type FormEvent } from "react";
import type { Task, TaskStatus, TaskPriority, AiSuggestion } from "../types";
import { aiApi } from "../api/client";

interface TaskModalProps {
  task: Task | null;
  onSave: (data: {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string;
    estimatedEffort: string;
    status: TaskStatus;
  }) => void;
  onClose: () => void;
}

export default function TaskModal({ task, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "med"
  );
  const [dueDate, setDueDate] = useState(task?.dueDate?.split("T")[0] || "");
  const [estimatedEffort, setEstimatedEffort] = useState(
    task?.estimatedEffort || ""
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status || "todo");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : "",
      estimatedEffort: estimatedEffort.trim(),
      status,
    });
    setIsSubmitting(false);
  };

  const handleAiSuggest = async () => {
    if (!title.trim()) return;

    setIsAiLoading(true);
    setAiSuggestion(null);

    try {
      const res = await aiApi.suggest({
        title: title.trim(),
        description: description.trim(),
      });
      setAiSuggestion(res.data.suggestion);
    } catch {
      setAiSuggestion({
        effort: "M (4-8 hours)",
        suggestedDueDate: new Date(
          Date.now() + 3 * 86400000
        ).toISOString().split("T")[0],
        reasoning:
          "AI service unavailable. This is a fallback estimate.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const acceptSuggestion = () => {
    if (aiSuggestion) {
      setEstimatedEffort(aiSuggestion.effort);
      setDueDate(aiSuggestion.suggestedDueDate);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h2>{task ? "Edit Task" : "New Task"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="taskTitle">Title</label>
            <input
              id="taskTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskDesc">Description</label>
            <textarea
              id="taskDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="taskPriority">Priority</label>
              <select
                id="taskPriority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="taskStatus">Status</label>
              <select
                id="taskStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="taskDue">Due Date</label>
              <input
                id="taskDue"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="taskEffort">Effort Estimate</label>
              <input
                id="taskEffort"
                type="text"
                value={estimatedEffort}
                onChange={(e) => setEstimatedEffort(e.target.value)}
                placeholder="e.g. S, M, L or 4h"
              />
            </div>
          </div>

          <div className="ai-section">
            <button
              type="button"
              className="btn btn-ai"
              onClick={handleAiSuggest}
              disabled={isAiLoading || !title.trim()}
            >
              {isAiLoading ? "✨ Thinking..." : "✨ Suggest Estimate"}
            </button>

            {aiSuggestion && (
              <div className="ai-suggestion">
                <div className="ai-suggestion-header">
                  <strong>AI Suggestion</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={acceptSuggestion}
                  >
                    Accept
                  </button>
                </div>
                <p>
                  <strong>Effort:</strong> {aiSuggestion.effort}
                </p>
                <p>
                  <strong>Due Date:</strong> {aiSuggestion.suggestedDueDate}
                </p>
                <p className="ai-reasoning">{aiSuggestion.reasoning}</p>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
