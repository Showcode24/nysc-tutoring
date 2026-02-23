import { Router, Request, Response } from "express";
import { requireAuth, requireTutor, authenticateToken } from "@/middleware/auth";
import AuthService from "@/services/authService";
import TutorService from "@/services/tutorService";
import { formatResponse, formatError } from "@/utils/index";
import {
  TutorRegisterRequest,
  TutorLoginRequest,
  TutorUploadDocumentRequest,
} from "@/types/index";

const router = Router();

/**
 * POST /tutors/register
 * Register a new tutor
 * Public endpoint
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const input: TutorRegisterRequest = req.body;

    // Validation
    if (
      !input.email ||
      !input.password ||
      !input.firstName ||
      !input.lastName ||
      !input.specialization ||
      input.yearsOfExperience === undefined ||
      !input.hourlyRate
    ) {
      return res
        .status(400)
        .json(formatError("Missing required fields", "VALIDATION_ERROR"));
    }

    const result = await AuthService.registerTutor(input);

    return res.status(201).json(
      formatResponse(true, {
        message: "Tutor registered successfully",
        tutorId: result.tutor.id,
        email: result.user.email,
      })
    );
  } catch (error: any) {
    console.error("[TutorRegister]", error);
    return res
      .status(400)
      .json(formatError(error.message, "REGISTRATION_FAILED"));
  }
});

/**
 * POST /tutors/login
 * Tutor login
 * Public endpoint
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const input: TutorLoginRequest = req.body;

    if (!input.email || !input.password) {
      return res
        .status(400)
        .json(formatError("Email and password required", "VALIDATION_ERROR"));
    }

    const result = await AuthService.tutorLogin(input);

    return res.json(
      formatResponse(true, {
        message: "Login successful",
        user: result.user,
        token: result.token,
      })
    );
  } catch (error: any) {
    console.error("[TutorLogin]", error);
    return res.status(401).json(formatError(error.message, "LOGIN_FAILED"));
  }
});

/**
 * GET /tutors/profile
 * Get current tutor profile
 * Protected endpoint - requires tutor authentication
 */
router.get("/profile", requireTutor, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json(formatError("Authentication required", "UNAUTHORIZED"));
    }

    const profile = await TutorService.getTutorProfile(req.user.userId);

    if (!profile) {
      return res.status(404).json(formatError("Tutor not found", "NOT_FOUND"));
    }

    return res.json(formatResponse(true, { profile }));
  } catch (error: any) {
    console.error("[GetTutorProfile]", error);
    return res
      .status(500)
      .json(formatError(error.message, "INTERNAL_ERROR"));
  }
});

/**
 * POST /tutors/documents
 * Upload document
 * Protected endpoint - requires tutor authentication
 */
router.post(
  "/documents",
  requireTutor,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const input: TutorUploadDocumentRequest = req.body;

      if (!input.documentType || !input.fileUrl || !input.fileName) {
        return res.status(400).json(
          formatError("Missing required fields", "VALIDATION_ERROR")
        );
      }

      // Get tutor ID from user
      const tutor = await AuthService.getUserById(req.user.userId);
      if (!tutor) {
        return res.status(404).json(formatError("Tutor not found", "NOT_FOUND"));
      }

      // For this API, we need to get the tutor ID from the user
      // This requires a query to find the tutor record
      const tutorProfile = await TutorService.getTutorProfile(
        req.user.userId
      );
      if (!tutorProfile) {
        return res.status(404).json(formatError("Tutor not found", "NOT_FOUND"));
      }

      const document = await TutorService.uploadDocument(
        tutorProfile.id,
        input
      );

      return res.status(201).json(
        formatResponse(true, {
          message: "Document uploaded successfully",
          document,
        })
      );
    } catch (error: any) {
      console.error("[UploadDocument]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

/**
 * GET /tutors/documents
 * Get tutor's documents
 * Protected endpoint - requires tutor authentication
 */
router.get(
  "/documents",
  requireTutor,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const tutorProfile = await TutorService.getTutorProfile(
        req.user.userId
      );
      if (!tutorProfile) {
        return res.status(404).json(formatError("Tutor not found", "NOT_FOUND"));
      }

      const documents = await TutorService.getTutorDocuments(tutorProfile.id);

      return res.json(formatResponse(true, { documents }));
    } catch (error: any) {
      console.error("[GetDocuments]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

/**
 * GET /tutors/status
 * Get current tutor status and gig access
 * Protected endpoint - requires tutor authentication
 */
router.get("/status", requireTutor, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json(formatError("Authentication required", "UNAUTHORIZED"));
    }

    const profile = await TutorService.getTutorProfile(req.user.userId);
    if (!profile) {
      return res.status(404).json(formatError("Tutor not found", "NOT_FOUND"));
    }

    return res.json(
      formatResponse(true, {
        status: profile.status,
        canAccessGigs: profile.status === "ACTIVE",
      })
    );
  } catch (error: any) {
    console.error("[GetTutorStatus]", error);
    return res
      .status(500)
      .json(formatError(error.message, "INTERNAL_ERROR"));
  }
});

/**
 * GET /tutors/gigs
 * View available gigs
 * Protected endpoint - only ACTIVE tutors can view
 */
router.get("/gigs", requireTutor, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json(formatError("Authentication required", "UNAUTHORIZED"));
    }

    const profile = await TutorService.getTutorProfile(req.user.userId);
    if (!profile) {
      return res.status(404).json(formatError("Tutor not found", "NOT_FOUND"));
    }

    const gigs = await TutorService.viewGigs(profile.id);

    return res.json(formatResponse(true, { gigs }));
  } catch (error: any) {
    console.error("[ViewGigs]", error);

    if (error.message.includes("Cannot view gigs")) {
      return res
        .status(403)
        .json(formatError(error.message, "ACCESS_DENIED"));
    }

    return res
      .status(500)
      .json(formatError(error.message, "INTERNAL_ERROR"));
  }
});

/**
 * GET /tutors/appointments
 * Get tutor's appointments
 * Protected endpoint - requires tutor authentication
 */
router.get(
  "/appointments",
  requireTutor,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const profile = await TutorService.getTutorProfile(req.user.userId);
      if (!profile) {
        return res.status(404).json(formatError("Tutor not found", "NOT_FOUND"));
      }

      const appointments =
        await TutorService.viewAppointments(profile.id);

      return res.json(formatResponse(true, { appointments }));
    } catch (error: any) {
      console.error("[GetAppointments]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

export default router;
