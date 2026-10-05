import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import { clerkMiddleware } from "@clerk/express";
import apiRoutes from "./routes/index";
import { errorMiddleware } from "./middlewares/error.middleware";
import { rateLimitMiddleware } from "./middlewares/rateLimit.middleware";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Enable Helmet for security headers
app.use(morgan("dev")); // Enable Morgan for logging
// app.use(rateLimitMiddleware); //Rate Limit
app.use(clerkMiddleware()); // Clerk middleware to handle authentication and user sessions

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy and running"});
});

// API routes
app.use('/api', apiRoutes); 

// Error handling middleware
app.use(errorMiddleware); 

export default app;
