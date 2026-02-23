import { Router } from "express";
import upload from "../middleware/upload";
import {
  deleteDocument,
  getTutorDocuments,
  uploadDocument,
} from "@/services/documentController";

const router = Router();

// POST /documents/upload - Upload a new document
router.post("/upload", upload.single("file"), uploadDocument);

// GET /documents/:tutorId - Get all documents for a tutor
router.get("/:tutorId", getTutorDocuments);

// DELETE /documents/:documentId - Delete a document
router.delete("/:documentId", deleteDocument);

export default router;
