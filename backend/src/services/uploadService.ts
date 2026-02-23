import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

export const uploadToR2 = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: string
): Promise<string> => {
  const key = `${folder}/${uuidv4()}-${originalName}`;

  await R2.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  // Return public URL
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
};