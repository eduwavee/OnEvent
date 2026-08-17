import "dotenv/config";
import cors from "cors";
import express from "express";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import eventsRoutes from "./routes/events.routes";
import myRegistrationsRoutes from "./routes/myRegistrations.routes";
import organizationsRoutes from "./routes/organizations.routes";
import { getPublicStats } from "./controllers/stats.controller";
import { asyncHandler } from "./utils/asyncHandler";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/stats", asyncHandler(getPublicStats));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/registrations", myRegistrationsRoutes);
app.use("/api/organizations", organizationsRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
