import { Request, Response } from 'express';
import Project from '../models/Project';

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body);

        // Add manager to project
        project.manager = req.user.id;
        
        try {
            await project.save();
            res.send('Project created successfully');
        } catch (error) {
            console.log(error);
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    { manager: {$in: req.user.id }}
                ]
            });           
            res.json(projects);
        } catch (error) {
            console.log(error);
            
        }
        
    }

    static getProjectById = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const project = await Project.findById(id).populate('tasks');
            if (!project) {
                res.status(404).json('Project not found');
                return;
            }
            if(project.manager.toString() !== req.user.id.toString()) {
                res.status(401).json('Unauthorized. Only the project manager can view this project');
                return;
            }
            res.json(project);
        } catch (error) {
            console.log(error);
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const project = await Project.findByIdAndUpdate(id, req.body);
            if (!project) {
                res.status(404).send('Project not found');
                return;
            }
            if(project.manager.toString() !== req.user.id.toString()) {
                res.status(401).json('Unauthorized. Only the project manager can update this project');
                return;
            }
            project.save();
            res.send('Project updated successfully');
        } catch (error) {
            console.log(error);
        }
    }

    static deleteProject = async (req: Request, res: Response) =>  {
        const { id } = req.params;
        try {
            const project = await Project.findById(id);
            if (!project) {
                res.status(404).send('Project not found');
                return;
            }
            if(project.manager.toString() !== req.user.id.toString()) {
                res.status(401).json('Unauthorized. Only the project manager can delete this project');
                return;
            }
            await project.deleteOne();
            res.send('Project deleted successfully');
        } catch (error) {
            console.log(error);
        }
    }
}