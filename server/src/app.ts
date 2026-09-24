import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import { clerkMiddleware } from "@clerk/express";

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware()); // Clerk middleware to handle authentication and user sessions


// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy and running"});
});


export default app;
