import { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamController {
    static findTeamMember = async (req: Request, res: Response) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email }).select('id name email');
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return 
            }
            res.status(200).json( user );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static addTeamMemberByID = async (req: Request, res: Response) => {
        const { id } = req.body;
        try {
            const user = await User.findById(id).select('id');
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return 
            }
            if(req.project.team.some( memberId => memberId.toString() === user.id.toString())) {
                res.status(409).json({ error: "User is already in the team" });
                return 
            }
            req.project.team.push(user);
            await req.project.save();

            res.status(200).json({ message: "User added to the team" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static removeTeamMemberByID = async (req: Request, res: Response) => {
        const { userId } = req.params;
        try {
            const user = await User.findById(userId).select('id');
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return 
            }
            if(!req.project.team.some( memberId => memberId.toString() === user.id.toString())) {
                res.status(409).json({ error: "User is not in the team" });
                return 
            }
            req.project.team = req.project.team.filter( memberId => memberId.toString() !== user.id.toString());
            await req.project.save();

            res.status(200).json({ message: "User removed from the team" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static getTeamMembers = async (req: Request, res: Response) => {
        try {
            const project = await Project.findById(req.params.projectId).populate('team', 'id name email');
            const team = project.team;
            res.status(200).json({ team });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}