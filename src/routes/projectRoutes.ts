import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { validateProjectExists } from "../middleware/project";
import { validateTaskBelongsToProject, validateTaskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";

const router = Router();

/* ROUTES FOR PROJECT */
router.post(
  "/",
  authenticate,
    body("projectName")
        .isString().withMessage("Name must be a string")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long")
        .notEmpty().withMessage("Name is required"),
    body("projectDescription")
        .isString().withMessage("Description must be a string")
        .isLength({ min: 3 }).withMessage("Description must be at least 3 characters long")
        .notEmpty().withMessage("Description is required"),
    body("clientName")
        .isString().withMessage("Client name must be a string")
        .isLength({ min: 3 }).withMessage("Client name must be at least 3 characters long")
        .notEmpty().withMessage("Client name is required"),
    handleInputErrors,
    ProjectController.createProject
);

router.get("/", ProjectController.getAllProjects);

router.get("/:id",
    param("id").isMongoId().withMessage("Invalid project ID"),
    handleInputErrors,
    ProjectController.getProjectById);

router.put("/:id",
    param("id").isMongoId().withMessage("Invalid project ID"),
    body("projectName")
        .isString().withMessage("Name must be a string")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long")
        .notEmpty().withMessage("Name is required"),
    body("projectDescription")
        .isString().withMessage("Description must be a string")
        .isLength({ min: 3 }).withMessage("Description must be at least 3 characters long")
        .notEmpty().withMessage("Description is required"),
    body("clientName")
        .isString().withMessage("Client name must be a string")
        .isLength({ min: 3 }).withMessage("Client name must be at least 3 characters long")
        .notEmpty().withMessage("Client name is required"),
    handleInputErrors,
    ProjectController.updateProject
)

router.delete("/:id",
    param("id").isMongoId().withMessage("Invalid project ID"),
    handleInputErrors,
    ProjectController.deleteProject
)

/* ROUTES FOR TASK */
router.param("projectId", validateProjectExists);

router.post("/:projectId/tasks",
    body("name")
        .isString().withMessage("Name must be a string")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long")
        .notEmpty().withMessage("Name is required"),
    body("description")
        .isString().withMessage("Description must be a string")
        .isLength({ min: 3 }).withMessage("Description must be at least 3 characters long")
        .notEmpty().withMessage("Description is required"),
    handleInputErrors,
    TaskController.createTask
)

router.get("/:projectId/tasks",
    handleInputErrors,
    TaskController.getAllTasks
)

router.param("taskId", validateTaskExists);
router.param("taskId", validateTaskBelongsToProject);

router.get("/:projectId/tasks/:taskId",
    param("taskId").isMongoId().withMessage("Invalid task ID"),
    handleInputErrors,
    TaskController.getTaskById
)

router.put("/:projectId/tasks/:taskId",
    param("taskId").isMongoId().withMessage("Invalid task ID"),
    body("name")
        .isString().withMessage("Name must be a string")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long")
        .notEmpty().withMessage("Name is required"),
    body("description")
        .isString().withMessage("Description must be a string")
        .isLength({ min: 3 }).withMessage("Description must be at least 3 characters long")
        .notEmpty().withMessage("Description is required"),
    handleInputErrors,
    TaskController.updateTask
)

router.delete("/:projectId/tasks/:taskId",
    param("taskId").isMongoId().withMessage("Invalid task ID"),
    handleInputErrors,
    TaskController.deleteTask
)

router.post("/:projectId/tasks/:taskId/status",
    param("taskId").isMongoId().withMessage("Invalid task ID"),
    body("status")
        .isString().withMessage("Status must be a string")
        .notEmpty().withMessage("Status is required"),
    handleInputErrors,
    TaskController.updateTaskStatus
)

export default router;
