import { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
    noteId: Types.ObjectId;
}

export class NoteController {
    static createNote = async (req: Request<{},{}, INote>, res: Response) => {
        const { content } = req.body;
        
        const note = new Note;
        note.content = content;
        note.task = req.task.id;
        note.createdBy = req.user.id;

        req.task.notes.push(note.id);

        try {
            await Promise.allSettled([note.save(), req.task.save()]);
            res.send('Note successfully created');
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }

    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({ task: req.task.id });
            res.json(notes);
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }

    static deleteNote = async (req: Request<NoteParams>, res: Response) => {
        const { noteId } = req.params;
        const note = await Note.findById(noteId);

        if(!note) {
            const error = new Error("Note not found");
            res.status(404).json({ message: error.message });
            return
        }

        if(note.createdBy.toString() !== req.user.id) {
            res.status(403).json({ message: "You are not authorized to delete this note" });
            return
        }

        try {
            req.task.notes = req.task.notes.filter((n) => n.toString() !== note.id);
            await Promise.allSettled([note.deleteOne(), req.task.save()]);
            res.send("Note deleted successfully");
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }
}