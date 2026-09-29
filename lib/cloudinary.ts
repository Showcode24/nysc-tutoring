import { v2 as cloudinary } from "cloudinary";

// Server-only. Never imported from a "use client" file — the API secret
// must not reach the browser bundle. Uploads go through app/api/upload,
// which is the sole caller of this config.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
