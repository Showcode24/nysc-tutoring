const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  keyFilename: "./serviceAccountKey.json",
});

async function setCors() {
  await storage.bucket("tutor-matchmaking-7324c.firebasestorage.app").setCorsConfiguration([
    {
      origin: ["http://localhost:3000", "https://yourdomain.com"],
      method: ["GET", "POST", "PUT", "DELETE"],
      maxAgeSeconds: 3600,
      responseHeader: ["Content-Type", "Authorization"],
    },
  ]);
  console.log("CORS configuration applied successfully!");
}

setCors().catch(console.error);