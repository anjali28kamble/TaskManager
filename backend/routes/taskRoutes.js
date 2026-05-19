const express = require("express");
const { body } = require("express-validator");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getTasks);
router.get("/:id", protect, getTaskById);

router.post(
  "/",
  protect,
  adminOnly,
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("projectId").notEmpty().withMessage("Project ID is required"),
  ],
  createTask
);

router.put("/:id", protect, updateTask);
router.delete("/:id", protect, adminOnly, deleteTask);

module.exports = router;
