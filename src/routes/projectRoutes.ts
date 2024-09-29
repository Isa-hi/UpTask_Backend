import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.post(
  "/",
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

export default router;
