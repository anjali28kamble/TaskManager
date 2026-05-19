const Task = require("../models/Task");
const Project = require("../models/Project");

// GET /api/dashboard - Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    let taskFilter = {};

    if (req.user.role === "member") {
      taskFilter.assignedTo = req.user._id;
    }

    // Get all tasks based on role
    const allTasks = await Task.find(taskFilter);

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === "completed").length;
    const pendingTasks = allTasks.filter((t) => t.status === "pending").length;
    const inProgressTasks = allTasks.filter((t) => t.status === "in-progress").length;

    // Overdue: dueDate has passed and status is not completed
    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "completed"
    ).length;

    let totalProjects = 0;
    if (req.user.role === "admin") {
      totalProjects = await Project.countDocuments();
    } else {
      totalProjects = await Project.countDocuments({ members: req.user._id });
    }

    // Recent tasks (last 5)
    const recentTasks = await Task.find(taskFilter)
      .populate("project", "name")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        totalProjects,
      },
      recentTasks,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

module.exports = { getDashboardStats };
