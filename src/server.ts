import express from 'express';
import { config } from 'dotenv';
import { connectDB } from './config/db';
import projectRouter from './routes/projectRoutes';

config(); // Load environment variables from .env file

connectDB(); // Connect to MongoDB

const app = express();
app.use(express.json()); // Enable JSON body parsing

app.use('/api/projects', projectRouter);

export default app;