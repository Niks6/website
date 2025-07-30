import { handleCors } from "./_lib/cors.js"

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  if (req.method === "GET") {
    res.status(200).json({
      success: true,
      message: "Server is running",
      timestamp: new Date().toISOString(),
      environment: {
        cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
        mongodb: !!process.env.MONGODB_URI,
      },
    })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}
