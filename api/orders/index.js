import { getDatabase } from "../_lib/mongodb.js"
import { handleCors } from "../_lib/cors.js"

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  try {
    if (req.method === "GET") {
      return await getOrders(req, res)
    } else if (req.method === "POST") {
      return await createOrder(req, res)
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

async function getOrders(req, res) {
  const db = await getDatabase("inventory-database")
  const collection = db.collection("orders")

  const orders = await collection.find({}).sort({ createdAt: -1 }).toArray()

  res.json({
    success: true,
    data: orders,
  })
}

async function createOrder(req, res) {
  const { Name, Address, "Mobile Number": MobileNumber, Type, cart } = req.body

  // Validate required fields
  if (!Name) {
    return res.status(400).json({
      success: false,
      error: "Name is required",
    })
  }

  const db = await getDatabase("inventory-database")
  const collection = db.collection("orders")

  // Prepare order data
  const orderData = {
    Name: Name,
    Address: Address || "",
    "Mobile Number": MobileNumber || null,
    Type: Type || "r",
    cart: cart || [],
    Status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Save to MongoDB
  const result = await collection.insertOne(orderData)

  res.json({
    success: true,
    message: "Order created successfully!",
    data: {
      id: result.insertedId,
      ...orderData,
    },
  })
}
