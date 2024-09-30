import type { Request, Response, NextFunction } from 'express';
import Project, { IProject } from '../models/Project';

declare global {
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}

export const validateProjectExists = async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).send("Project not found");
      return;
    }
    req.project = project;
    next();
}