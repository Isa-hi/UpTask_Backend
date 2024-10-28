import { Request, Response } from "express";
import Task from "../models/Task";
import Project from "../models/Project";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id;
      req.project.tasks.push(task);
      await Promise.allSettled([task.save(), req.project.save()]);
      res.send("Task created successfully");
    } catch (error) {
      res.status(500).send("Error creating task");
    }
  };

  static getAllTasks = async (req: Request, res: Response) => {
    const project = req.project.id;
    try {
      const tasks = await Task.find({ project }).populate("project");
      res.json(tasks);
    } catch (error) {
      res.status(500).send("Error fetching tasks");
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task).populate({path: "completedBy.user", select: "id name email"});
      res.json(task);
    } catch (error) {
      res.status(500).send("Error fetching task");
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      await Task.findByIdAndUpdate(req.task, req.body);
      res.send("Task updated successfully");
    } catch (error) {
      res.status(500).send("Error updating task");
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      req.project.tasks = req.project.tasks.filter(
        (t) => t.toString() !== req.task.id
      );
      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.send("Task deleted successfully");
    } catch (error) {
      res.status(500).send("Error deleting task");
    }
  };

  static updateTaskStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      req.task.status = status;

      req.task.completedBy.push({ user: req.user.id, status });
      
      await req.task.save();
      res.send("Task status updated successfully");
    } catch (error) {
      res.status(500).send("Error updating task status");
    }
  };
}
