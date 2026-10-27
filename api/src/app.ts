/**
 * Express application composition root.
 * Wires together middleware, routes, and error handling.
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { config } from "../lib/env";
import { requestIds } from "./middleware/request-id";
import { errorHandler } from "./middleware/error-handler";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/projects.routes";
import generationRoutes from "./routes/generation.routes";
import adminRoutes from "./routes/admin.routes";
import billingRoutes from "./routes/billing.routes";
import domainRoutes from "./routes/domains.routes";
import deploymentRoutes from "./routes/deployments.routes";
import supportRoutes from "./routes/support.routes";
import customerRoutes from "./routes/customer.routes";
import session from "express-session";


const app = express();

// Security headers & CORS
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Session middleware — must be before authentication routes
app.use(
  session({
    name: "maatix.sid",
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(requestIds);

// Global rate limiter
app.use(rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Routes (order matters — health first, then auth, then protected)
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/generation", generationRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found.", requestId: (res as any).getHeader("X-Request-ID") || "" } });
});

// Global error handler
app.use(errorHandler);

export { app };
