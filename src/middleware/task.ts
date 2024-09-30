import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

declare global {
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

export const validateTaskExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404).send("Task not found");
    return;
  }

  req.task = task;
  next();
};

export const validateTaskBelongsToProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.task.project.toString() !== req.project.id.toString()) {
    res.status(403).send("Task does not belong to project");
    return;
  }
  next();
};
