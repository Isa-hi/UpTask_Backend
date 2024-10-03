import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { corsConfig } from './config/cors';
import { connectDB } from './config/db';
import projectRouter from './routes/projectRoutes';

config(); // Load environment variables from .env file

connectDB(); // Connect to MongoDB

const app = express();
app.use(morgan('dev')); // Enable logging of HTTP requests
app.use(cors(corsConfig)); // Enable CORS
app.use(express.json()); // Enable JSON body parsing

app.use('/api/projects', projectRouter);

export default app;