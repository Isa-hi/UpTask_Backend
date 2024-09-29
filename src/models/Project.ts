import mongoose, {Schema, Document} from "mongoose";

//TypeScript type for Project
type ProjectType = Document & {
    projectName: string
    clientName: string
    projectDescription: string
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
    }
})

const Project = mongoose.model<ProjectType>("Project", ProjectSchema);
export default Project;
