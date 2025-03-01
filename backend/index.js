import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";

import connectDB from "./config/db.js";

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.listen(port, () => console.log(`Server running on port ${port}`));
