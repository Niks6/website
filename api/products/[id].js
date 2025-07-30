import { getDatabase } from "../_lib/mongodb.js"
import { handleCors } from "../_lib/cors.js"

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  const { id } = req.query
  const productId = Number.parseInt(id)

  if (isNaN(productId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid product ID",
    })
  }

  try {
    if (req.method === "GET") {
      const db = await getDatabase()
      const collection = db.collection("products")

      const product = await collection.findOne({ productId: productId })

      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        })
      }

      res.json({
        success: true,
        data: product,
      })
    } else {
      res.status(405).json({ error: "Method not allowed" })
    }
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    })
  }
}
