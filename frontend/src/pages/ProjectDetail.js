import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProjectByIdAPI,
  getTasksAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI,
  getAllUsersAPI,
  addMemberAPI,
  removeMemberAPI,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "pending",
    dueDate: "",
    assignedTo: "",
  });
  const [taskError, setTaskError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Member modal state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
  fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

  const fetchAll = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        getProjectByIdAPI(id),
        getTasksAPI({ projectId: id }),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);

      if (isAdmin()) {
        const usersRes = await getAllUsersAPI();
        setAllUsers(usersRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: "", description: "", status: "pending", dueDate: "", assignedTo: "" });
    setTaskError("");
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      assignedTo: task.assignedTo?._id || "",
    });
    setTaskError("");
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setTaskError("");
    setSubmitting(true);

    try {
      if (editingTask) {
        const res = await updateTaskAPI(editingTask._id, {
          ...taskForm,
          projectId: id,
          assignedTo: taskForm.assignedTo || null,
        });
        setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data.task : t)));
      } else {
        const res = await createTaskAPI({
          ...taskForm,
          projectId: id,
          assignedTo: taskForm.assignedTo || null,
        });
        setTasks([res.data.task, ...tasks]);
      }
      setShowTaskModal(false);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setTaskError(errors?.[0]?.msg || err.response?.data?.message || "Error saving task");
    } finally {
      setSubmitting(false);
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

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await updateTaskAPI(task._id, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data.task : t)));
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      const res = await addMemberAPI(id, selectedUserId);
      setProject(res.data.project);
      setSelectedUserId("");
      setShowMemberModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error adding member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      const res = await removeMemberAPI(id, userId);
      setProject(res.data.project);
    } catch (err) {
      alert("Error removing member");
    }
  };

  const isOverdue = (task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // Get users not already in project (for adding members)
  const availableUsers = allUsers.filter(
    (u) => !project?.members?.some((m) => m._id === u._id)
  );

  if (loading) return <div className="loading"><span className="spinner"></span>Loading project...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!project) return <div className="alert alert-error">Project not found</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/projects")}
            style={{ marginBottom: 8 }}
          >
            ← Back
          </button>
          <h1>{project.name}</h1>
          {project.description && <p>{project.description}</p>}
        </div>
        {isAdmin() && (
          <button className="btn btn-primary" onClick={openCreateTask}>
            + Add Task
          </button>
        )}
      </div>

      {/* Members Section */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Team Members ({project.members.length})</div>
          {isAdmin() && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
              + Add Member
            </button>
          )}
        </div>

        {project.members.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 14 }}>No members yet.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {project.members.map((member) => (
              <div
                key={member._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  background: "var(--bg-dark)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                }}
              >
                <div className="member-avatar" style={{ margin: 0, width: 22, height: 22, fontSize: 9 }}>
                  {member.name.charAt(0)}
                </div>
                <span>{member.name}</span>
                <span className={`badge badge-${member.role}`} style={{ padding: "1px 6px", fontSize: 9 }}>
                  {member.role}
                </span>
                {isAdmin() && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="section-title">Tasks ({tasks.length})</div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40 }}>✅</div>
          <p>No tasks in this project yet.{isAdmin() ? " Add one!" : ""}</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
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
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditTask(task)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? "Edit Task" : "New Task"}</h3>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>×</button>
            </div>

            {taskError && <div className="alert alert-error">{taskError}</div>}

            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Task title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="What needs to be done?"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                >
                  <option value="">-- Unassigned --</option>
                  {project.members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Member</h3>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}>×</button>
            </div>

            <div className="form-group">
              <label>Select User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Select a user --</option>
                {availableUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email}) - {u.role}
                  </option>
                ))}
              </select>
            </div>
            {availableUsers.length === 0 && (
              <p className="text-muted" style={{ fontSize: 13 }}>All users are already members.</p>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddMember} disabled={!selectedUserId}>
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
