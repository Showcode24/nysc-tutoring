// Client-side helper for uploading a file through /api/upload (Cloudinary).
// Replaces the old direct-to-Firebase-Storage uploads — the actual
// Cloudinary call happens server-side (see app/api/upload/route.ts) so the
// API secret never reaches the browser.

export interface UploadedFile {
  url: string;
  publicId: string;
  fileName: string;
}

export async function uploadDocumentFile(
  file: File,
  folder: string,
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Failed to upload file.");
  }

  return { url: data.url, publicId: data.publicId, fileName: data.fileName };
}
