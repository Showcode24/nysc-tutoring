import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "../services/uploadService";

const prisma = new PrismaClient();

const ALLOWED_TYPES = ["GOVERNMENT_ID", "CERTIFICATE", "DEGREE", "OTHER"];

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { document_type, tutor_id, file_name } = req.body;

    if (!ALLOWED_TYPES.includes(document_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type. Allowed: GOVERNMENT_ID, CERTIFICATE, DEGREE, OTHER",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    if (!tutor_id) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID is required",
      });
    }

    // Upload to R2
    const fileUrl = await uploadToR2(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      `tutors/${tutor_id}`
    );

    // Save to database with Prisma
    const document = await prisma.tutorDocument.create({
      data: {
        tutorId: tutor_id,
        documentType: document_type,
        fileName: file_name || req.file.originalname,
        fileUrl: fileUrl,
      },
    });

    return res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("[v0] Upload error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
    });
  }
};

export const getTutorDocuments = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;

    const documents = await prisma.tutorDocument.findMany({
      where: { tutorId },
      orderBy: { uploadedAt: "desc" },
    });

    return res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("[v0] Fetch documents error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    await prisma.tutorDocument.delete({
      where: { id: documentId },
    });

    return res.json({
      success: true,
      message: "Document deleted",
    });
  } catch (error) {
    console.error("[v0] Delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
};