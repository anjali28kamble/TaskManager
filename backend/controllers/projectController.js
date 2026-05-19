const { validationResult } = require("express-validator");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

// GET /api/projects - Get all projects (admin sees all, member sees only their projects)
const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === "admin") {
      projects = await Project.find()
        .populate("createdBy", "name email")
        .populate("members", "name email")
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate("createdBy", "name email")
        .populate("members", "name email")
        .sort({ createdAt: -1 });
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects" });
  }
};

// GET /api/projects/:id - Get single project
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Members can only view projects they are part of
    if (
      req.user.role !== "admin" &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project" });
  }
};

// POST /api/projects - Create project (admin only)
const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, members } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    const populated = await Project.findById(project._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.status(201).json({ message: "Project created", project: populated });
  } catch (error) {
    res.status(500).json({ message: "Error creating project" });
  }
};

// PUT /api/projects/:id - Update project (admin only)
const updateProject = async (req, res) => {
  const { name, description, members } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;
    project.members = members !== undefined ? members : project.members;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.json({ message: "Project updated", project: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating project" });
  }
};

// DELETE /api/projects/:id - Delete project (admin only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Also delete all tasks in this project
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: "Project and its tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project" });
  }
};

// POST /api/projects/:id/members - Add member to project (admin only)
const addMember = async (req, res) => {
  const { userId } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    project.members.push(userId);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.json({ message: "Member added", project: updated });
  } catch (error) {
    res.status(500).json({ message: "Error adding member" });
  }
};

// DELETE /api/projects/:id/members/:userId - Remove member (admin only)
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();

    const updated = await Project.findById(project._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    res.json({ message: "Member removed", project: updated });
  } catch (error) {
    res.status(500).json({ message: "Error removing member" });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
