import mongoose, {Schema, Document, PopulatedDoc, Types} from "mongoose";
import { ITask } from "./Task";
import { IUser } from "./User";

//TypeScript type for Project
export interface IProject extends Document {
    projectName: string
    clientName: string
    projectDescription: string,
    tasks: PopulatedDoc<ITask & Document>[]
    manager: PopulatedDoc<IUser & Document>
}

//Monngoose Schema for Project
const ProjectSchema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    projectDescription: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [{
        type: Types.ObjectId,
        ref: "Task"
    }],
    manager: {
        type: Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

const Project = mongoose.model<IProject>("Project", ProjectSchema);
export default Project;
