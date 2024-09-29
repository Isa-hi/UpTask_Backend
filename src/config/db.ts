import mongoose from "mongoose";
import colors from "colors";

export const connectDB =  async () => {
    try {
        const {connection} = await mongoose.connect(process.env.DATABASE_URL)
        const url =  `${connection.host}:${connection.port}`;
        console.log(colors.blue(`MongoDB Connected: ${url}`));
    } catch (error) {
        console.log(colors.bgRed(`Error al conectar a MongoDB: ${error.message}`));
        process.exit(1);
    }
}