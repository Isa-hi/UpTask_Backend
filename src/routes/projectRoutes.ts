import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { validateProjectExists } from "../middleware/project";
import {
  validateTaskBelongsToProject,
  validateTaskExists,
} from "../middleware/task";
import { authenticate, hasAuthorization } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();

router.use(authenticate);

/* ROUTES FOR PROJECT */
router.post(
  "/",
  body("projectName")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long")
    .notEmpty()
    .withMessage("Name is required"),
  body("projectDescription")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 3 })
    .withMessage("Description must be at least 3 characters long")
    .notEmpty()
    .withMessage("Description is required"),
  body("clientName")
    .isString()
    .withMessage("Client name must be a string")
    .isLength({ min: 3 })
    .withMessage("Client name must be at least 3 characters long")
    .notEmpty()
    .withMessage("Client name is required"),
  handleInputErrors,
  ProjectController.createProject
);

router.get("/", ProjectController.getAllProjects);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid project ID"),
  handleInputErrors,
  ProjectController.getProjectById
);

/* ROUTES FOR TASK */
router.param("projectId", validateProjectExists);

router.put(
  "/:projectId",
  param("projectId").isMongoId().withMessage("Invalid project ID"),
  body("projectName")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long")
    .notEmpty()
    .withMessage("Name is required"),
  body("projectDescription")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 3 })
    .withMessage("Description must be at least 3 characters long")
    .notEmpty()
    .withMessage("Description is required"),
  body("clientName")
    .isString()
    .withMessage("Client name must be a string")
    .isLength({ min: 3 })
    .withMessage("Client name must be at least 3 characters long")
    .notEmpty()
    .withMessage("Client name is required"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
);

router.delete(
  "/:projectId",
  param("projectId").isMongoId().withMessage("Invalid project ID"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
);

router.post(
  "/:projectId/tasks",
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long")
    .notEmpty()
    .withMessage("Name is required"),
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 3 })
    .withMessage("Description must be at least 3 characters long")
    .notEmpty()
    .withMessage("Description is required"),
  handleInputErrors,
  TaskController.createTask
);

router.get("/:projectId/tasks", handleInputErrors, TaskController.getAllTasks);

router.param("taskId", validateTaskExists);
router.param("taskId", validateTaskBelongsToProject);

router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  handleInputErrors,
  TaskController.getTaskById
);

router.put(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long")
    .notEmpty()
    .withMessage("Name is required"),
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 3 })
    .withMessage("Description must be at least 3 characters long")
    .notEmpty()
    .withMessage("Description is required"),
  handleInputErrors,
  TaskController.updateTask
);

router.delete(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  handleInputErrors,
  TaskController.deleteTask
);

router.post(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  body("status")
    .isString()
    .withMessage("Status must be a string")
    .notEmpty()
    .withMessage("Status is required"),
  handleInputErrors,
  TaskController.updateTaskStatus
);

router.post(
  "/:projectId/team/find",
  body("email")
    .isEmail()
    .withMessage("Email is invalid")
    .notEmpty()
    .withMessage("Email is required"),
  handleInputErrors,
  TeamController.findTeamMember
);

router.get("/:projectId/team", TeamController.getTeamMembers);

router.post(
  "/:projectId/team",
  body("id")
    .isMongoId()
    .withMessage("ID is invalid")
    .notEmpty()
    .withMessage("ID is required"),
  handleInputErrors,
  TeamController.addTeamMemberByID
);

router.delete(
  "/:projectId/team/:userId",
  param("userId")
    .isMongoId()
    .withMessage("ID is invalid")
    .notEmpty()
    .withMessage("ID is required"),
  handleInputErrors,
  TeamController.removeTeamMemberByID
);

/** ROUTES FOR NOTES */
router.post(
  "/:projectId/tasks/:taskId/notes",
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  body("content")
    .isString()
    .withMessage("Content must be a string")
    .isLength({ min: 3 })
    .withMessage("Content must be at least 3 characters long")
    .notEmpty()
    .withMessage("Content is required"),
  handleInputErrors,
  NoteController.createNote
);

router.get("/:projectId/tasks/:taskId/notes", NoteController.getTaskNotes);

router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("Invalid note ID"),
  handleInputErrors,
  NoteController.deleteNote
);

export default router;
