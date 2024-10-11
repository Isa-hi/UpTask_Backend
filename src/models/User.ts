import mongoose, {Document, Schema} from "mongoose";

//TypeScript type for User
export interface IUser extends Document {
    email: string,
    password: string
    name: string,
    confirmed: boolean
}

//Monngoose Schema for User
const UserSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
},{timestamps: true})

const User = mongoose.model<IUser>("User", UserSchema);
export default User;