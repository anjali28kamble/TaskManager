import React, { useState, useEffect } from "react";
import { getDashboardAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboardAPI();
      setData(res.data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (task) => {
    return (
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== "completed"
    );
  };

  if (loading) return <div className="loading"><span className="spinner"></span>Loading dashboard...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const { stats, recentTasks } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-number">{stats.totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-number">{stats.completedTasks}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pendingTasks}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card inprogress">
          <div className="stat-number">{stats.inProgressTasks}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card overdue">
          <div className="stat-number">{stats.overdueTasks}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card projects">
          <div className="stat-number">{stats.totalProjects}</div>
          <div className="stat-label">Projects</div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="card-title">Recent Tasks</div>
        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet.</p>
          </div>
        ) : (
          <div className="task-list">
            {recentTasks.map((task) => (
              <div
                key={task._id}
                className={`task-item ${isOverdue(task) ? "overdue" : ""}`}
              >
                <div className="task-info">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span>📁 {task.project?.name}</span>
                    {task.assignedTo && (
                      <span>👤 {task.assignedTo?.name}</span>
                    )}
                    <span>📅 {formatDate(task.dueDate)}</span>
                    {isOverdue(task) && (
                      <span className="text-danger">⚠ Overdue</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className={`badge badge-${task.status === "in-progress" ? "in-progress" : task.status}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
