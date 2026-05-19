import React, { useState, useEffect } from "react";
import { getTasksAPI, updateTaskAPI, deleteTaskAPI, getProjectsAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        getTasksAPI(),
        getProjectsAPI(),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await updateTaskAPI(task._id, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data.task : t)));
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTaskAPI(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      alert("Error deleting task");
    }
  };

  const isOverdue = (task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // Filter tasks based on dropdowns
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterProject && task.project?._id !== filterProject) return false;
    return true;
  });

  if (loading) return <div className="loading"><span className="spinner"></span>Loading tasks...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>
            {isAdmin() ? "All tasks across projects" : "Your assigned tasks"}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {(filterStatus || filterProject) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setFilterStatus(""); setFilterProject(""); }}
          >
            Clear Filters
          </button>
        )}

        <span className="text-muted" style={{ fontSize: 13, alignSelf: "center" }}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40 }}>📋</div>
          <p>No tasks found.</p>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`task-item ${isOverdue(task) ? "overdue" : ""}`}
            >
              <div className="task-info">
                <div className="task-title">{task.title}</div>
                {task.description && (
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                    {task.description}
                  </div>
                )}
                <div className="task-meta">
                  <span
                    style={{ cursor: "pointer", color: "var(--accent)" }}
                    onClick={() => navigate(`/projects/${task.project?._id}`)}
                  >
                    📁 {task.project?.name}
                  </span>
                  {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                  <span>📅 {formatDate(task.dueDate)}</span>
                  {isOverdue(task) && <span className="text-danger">⚠ Overdue</span>}
                </div>
              </div>

              <div className="task-actions">
                {/* Members can update status of their own tasks */}
                {!isAdmin() && task.assignedTo?._id === user._id ? (
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    style={{
                      padding: "4px 8px",
                      background: "var(--bg-dark)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      color: "var(--text-primary)",
                      fontSize: 12,
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <span className={`badge badge-${task.status === "in-progress" ? "in-progress" : task.status}`}>
                    {task.status}
                  </span>
                )}

                {isAdmin() && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tasks;
