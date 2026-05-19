const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const Project = require("../models/Project");

// GET /api/tasks - Get tasks
// Admin: all tasks or by project
// Member: only their assigned tasks
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let filter = {};

    if (req.user.role === "admin") {
      if (projectId) filter.project = projectId;
    } else {
      filter.assignedTo = req.user._id;
      if (projectId) filter.project = projectId;
    }

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

// GET /api/tasks/:id - Get single task
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name members")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Members can only see tasks assigned to them
    if (
      req.user.role !== "admin" &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task" });
  }
};

// POST /api/tasks - Create task (admin only)
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, status, dueDate, projectId, assignedTo } = req.body;

  try {
    // Check project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.create({
      title,
      description,
      status: status || "pending",
      dueDate,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(201).json({ message: "Task created", task: populated });
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
};

// PUT /api/tasks/:id - Update task
// Admin: can update everything
// Member: can only update status
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role === "member") {
      // Members can only update status of their own tasks
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only update your own tasks" });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Members can only update task status" });
      }

      task.status = status;
    } else {
      // Admin can update everything
      const { title, description, status, dueDate, assignedTo, projectId } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (projectId) task.project = projectId;
    }

    await task.save();

    const updated = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json({ message: "Task updated", task: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
};

// DELETE /api/tasks/:id - Delete task (admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
