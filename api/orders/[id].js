import { getDatabase } from "../_lib/mongodb.js"
import { handleCors } from "../_lib/cors.js"
import { ObjectId } from "mongodb"

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  const { id } = req.query

  // Check if it's a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid order ID",
    })
  }

  try {
    if (req.method === "GET") {
      return await getOrder(req, res, id)
    } else if (req.method === "PATCH") {
      return await updateOrder(req, res, id)
    } else {
      res.status(405).json({ error: "Method not allowed" })
    }
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    })
  }
}

async function getOrder(req, res, orderId) {
  const db = await getDatabase("inventory-database")
  const collection = db.collection("orders")

  const order = await collection.findOne({ _id: new ObjectId(orderId) })

  if (!order) {
    return res.status(404).json({
      success: false,
      error: "Order not found",
    })
  }

  res.json({
    success: true,
    data: order,
  })
}

async function updateOrder(req, res, orderId) {
  const { Status, status, actionDate } = req.body

  // Use Status (capital S) to match your data structure
  const orderStatus = Status || status
  if (!orderStatus || !["accepted", "rejected", "pending"].includes(orderStatus)) {
    return res.status(400).json({
      success: false,
      error: "Invalid status. Must be 'accepted', 'rejected', or 'pending'",
    })
  }

  const db = await getDatabase("inventory-database")
  const collection = db.collection("orders")

  const updateData = {
    Status: orderStatus,
    updatedAt: new Date(),
  }

  if (actionDate) {
    updateData.actionDate = new Date(actionDate)
  }

  const result = await collection.updateOne({ _id: new ObjectId(orderId) }, { $set: updateData })

  if (result.matchedCount === 0) {
    return res.status(404).json({
      success: false,
      error: "Order not found",
    })
  }

  res.json({
    success: true,
    message: `Order ${orderStatus} successfully`,
  })
}
