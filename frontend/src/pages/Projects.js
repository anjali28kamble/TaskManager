import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectsAPI, createProjectAPI, deleteProjectAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await getProjectsAPI();
      setProjects(res.data);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await createProjectAPI(formData);
      setProjects([res.data.project, ...projects]);
      setShowModal(false);
      setFormData({ name: "", description: "" });
    } catch (err) {
      const errors = err.response?.data?.errors;
      setFormError(errors?.[0]?.msg || err.response?.data?.message || "Error creating project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project and all its tasks?")) return;

    try {
      await deleteProjectAPI(id);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      alert("Error deleting project");
    }
  };

  if (loading) return <div className="loading"><span className="spinner"></span>Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin() && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {projects.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40 }}>📁</div>
          <p>No projects yet.{isAdmin() ? " Create one to get started!" : ""}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project._id}
              className="project-card"
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              <h3>{project.name}</h3>
              <p>{project.description || "No description provided"}</p>
              <div className="project-card-footer">
                <div className="member-avatars">
                  {project.members.slice(0, 4).map((member) => (
                    <div key={member._id} className="member-avatar" title={member.name}>
                      {member.name.charAt(0)}
                    </div>
                  ))}
                  {project.members.length > 4 && (
                    <div className="member-avatar">+{project.members.length - 4}</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                  </span>
                  {isAdmin() && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => handleDelete(project._id, e)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Project</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the project..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
