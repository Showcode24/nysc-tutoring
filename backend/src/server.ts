import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { authenticateToken } from "@/middleware/auth";
import tutorRoutes from "@/routes/tutorRoutes";
import adminRoutes from "@/routes/adminRoutes";
import { setupNotificationHandlers } from "@/services/eventService";
import { formatResponse } from "@/utils/index";
import upload from "./middleware/upload";
import { deleteDocument, getTutorDocuments, uploadDocument } from "./services/documentController";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Authentication middleware (applies to all routes)
app.use(authenticateToken);

// ==================== ROUTES ====================

/**
 * Health check endpoint
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/**
 * API info endpoint
 */
app.get("/api", (req: Request, res: Response) => {
  res.json(
    formatResponse(true, {
      name: "Kopa360 Backend API",
      version: "1.0.0",
      endpoints: {
        tutor: "/api/tutors",
        admin: "/api/admin",
      },
    }),
  );
});
 
app.post("/documents/upload", upload.single("file"), uploadDocument);
app.get("/documents/:tutorId", getTutorDocuments);
app.delete("/documents/:documentId", deleteDocument);

/**
 * Tutor routes
 * POST   /api/tutors/register        - Register new tutor
 * POST   /api/tutors/login           - Tutor login
 * GET    /api/tutors/profile         - Get profile (protected)
 * POST   /api/tutors/documents       - Upload document (protected)
 * GET    /api/tutors/documents       - Get documents (protected)
 * GET    /api/tutors/status          - Get status (protected)
 * GET    /api/tutors/gigs            - View gigs (protected, ACTIVE only)
 * GET    /api/tutors/appointments    - Get appointments (protected)
 */
app.use("/api/tutors", tutorRoutes);

/**
 * Admin routes
 * POST   /api/admin/login                         - Admin login
 * GET    /api/admin/tutors/pending                - Get pending tutors (protected)
 * GET    /api/admin/tutors/:tutorId               - Get tutor details (protected)
 * POST   /api/admin/appointments/schedule         - Schedule appointment (protected)
 * POST   /api/admin/appointments/:appointmentId/check-in - Check in (protected)
 * POST   /api/admin/tutors/:tutorId/approve       - Approve tutor (protected)
 * POST   /api/admin/tutors/:tutorId/reject        - Reject tutor (protected)
 * GET    /api/admin/audit-logs                    - Get audit logs (protected)
 * GET    /api/admin/tutors/:tutorId/timeline      - Get timeline (protected)
 */
app.use("/api/admin", adminRoutes);

// ==================== ERROR HANDLING ====================

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res
    .status(404)
    .json(formatResponse(false, undefined, "Endpoint not found", "NOT_FOUND"));
});

/**
 * Global error handler
 */
app.use((error: any, req: Request, res: Response) => {
  console.error("[GlobalErrorHandler]", error);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res
    .status(statusCode)
    .json(formatResponse(false, undefined, message, "INTERNAL_ERROR"));
});

// ==================== EVENT SYSTEM ====================

// Setup notification handlers
setupNotificationHandlers();

// ==================== SERVER START ====================

const server = app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════╗
║     Kopa360 Backend Server        ║
║         v1.0.0                      ║
╠═════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || "development").padEnd(22)}║
║  Port: ${String(PORT).padEnd(29)}║
║  Database: PostgreSQL               ║
║  Auth: JWT + Role-Based             ║
╚═════════════════════════════════════╝
  `);

  console.log("✓ Middleware initialized");
  console.log("✓ Routes registered");
  console.log("✓ Event system active");
  console.log("✓ Ready to accept connections\n");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
