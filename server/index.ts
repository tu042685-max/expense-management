import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// Import routes
import authRoutes from "./routes/authRoutes";
import groupRoutes from "./routes/groupRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import invitationRoutes from "./routes/invitationRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import badgesRoutes from "./routes/badgesRoutes";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/invitation", invitationRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api", badgesRoutes);


// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ message: "Server is running", timestamp: new Date() });
});

// Serve static files in production
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "../client/dist")));
  app.get("/:path", (req, res) => {
    res.sendFile(path.join(process.cwd(), "../client/dist/index.html"));
  });
}

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});