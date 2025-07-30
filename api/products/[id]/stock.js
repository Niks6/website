import { getDatabase } from "../../_lib/mongodb.js"
import { handleCors } from "../../_lib/cors.js"

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  const { id } = req.query
  const productId = Number.parseInt(id)

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { stock } = req.body

    if (isNaN(productId) || isNaN(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID or stock value",
      })
    }

    const db = await getDatabase()
    const collection = db.collection("products")

    const result = await collection.updateOne(
      { productId: productId },
      {
        $set: {
          stock: Number.parseInt(stock),
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      })
    }

    res.json({
      success: true,
      message: "Stock updated successfully",
    })
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update stock",
    })
  }
}
