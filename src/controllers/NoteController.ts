import { Request, Response } from "express";
import Note, { INote } from "../models/Note";

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
}