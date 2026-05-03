import dns from 'node:dns/promises';

// Forces Node to use public DNS servers that support SRV records
dns.setServers(['1.1.1.1', '8.8.8.8']);

import express from "express";
import cors from "cors";
import mongoose from "mongoose";   
import authRouter from "./routes/auth.js";
import projectRouter from "./routes/project.js";
import taskRouter from "./routes/task.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected");

        app.listen(process.env.PORT , () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

startServer();

//routes

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server running" });
})
app.use("/api", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/dashboard", dashboardRouter);


