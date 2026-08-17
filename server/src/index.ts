import "dotenv/config";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes";
import eventsRoutes from "./routes/events.routes";
import myRegistrationsRoutes from "./routes/myRegistrations.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/registrations", myRegistrationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
