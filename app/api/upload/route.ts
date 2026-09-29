import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// ─────────────────────────────────────────────────────────────
//  POST /api/upload
//  multipart/form-data: { file: File, folder?: string }
//
//  Replaces the old client-side Firebase Storage upload. Kept server-side
//  (rather than an unsigned Cloudinary preset called directly from the
//  browser) because these are verification documents — government ID,
//  degree certificates — and a public unsigned preset would let anyone who
//  finds the cloud name upload arbitrary files to the account. Validation
//  mirrors what the client already checked, but re-checked here since the
//  client can't be trusted.
// ─────────────────────────────────────────────────────────────

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// The Cloudinary Node SDK needs Node APIs (streams, https) — must not run
// on the Edge runtime.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("[upload] Cloudinary env vars are not configured.");
      return NextResponse.json(
        { error: "File uploads are not configured on the server." },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file was provided." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, JPG, and PNG files are allowed." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Max size is 10MB." },
        { status: 400 },
      );
    }

    const safeFolder =
      typeof folder === "string" && /^[a-zA-Z0-9/_-]+$/.test(folder)
        ? folder
        : "documents/misc";

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `kopa360/${safeFolder}`,
          resource_type: "auto", // PDFs upload as "raw"/"image" automatically
          use_filename: true,
          unique_filename: true,
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error || new Error("Cloudinary upload returned no result"));
            return;
          }
          resolve(uploadResult as { secure_url: string; public_id: string });
        },
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("[upload] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file." },
      { status: 500 },
    );
  }
}
