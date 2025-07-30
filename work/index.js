import express from "express"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { MongoClient } from "mongodb"
import cors from "cors"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Environment variables with defaults
const requiredEnvVars = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "daq7zegts",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "451399825177962",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "lqwc2ASQ2ZAmmUDrOyMGhGP1oqU",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://golu:golu1234@cluster0.i7alpbh.mongodb.net/",
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: requiredEnvVars.CLOUDINARY_CLOUD_NAME,
  api_key: requiredEnvVars.CLOUDINARY_API_KEY,
  api_secret: requiredEnvVars.CLOUDINARY_API_SECRET,
})

// MongoDB connection
let client
try {
  client = new MongoClient(requiredEnvVars.MONGODB_URI)
  console.log("✅ MongoDB client initialized")
} catch (error) {
  console.error("❌ Failed to initialize MongoDB client:", error.message)
  process.exit(1)
}

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    credentials: true,
  }),
)
app.use(express.json())

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Please upload only image files"), false)
    }
  },
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: {
      cloudinary: !!requiredEnvVars.CLOUDINARY_CLOUD_NAME,
      mongodb: !!requiredEnvVars.MONGODB_URI,
    },
  })
})

// API endpoint to handle product form submission
app.post("/api/products", upload.single("productImage"), async (req, res) => {
  let dbClient = null

  try {
    const {
      productId,
      productCompany,
      productItem,
      productStock,
      productPrice,
      productWh,
      productMrp,
      productDescription,
    } = req.body

    const imageFile = req.file

    // Validate required fields
    if (!productId || !productCompany || !productItem || !productStock || !productPrice || !imageFile) {
      return res.status(400).json({
        success: false,
        error: "Product ID, Company, Name, Stock, Price, and Image are required",
      })
    }

    // Validate numeric fields
    const numericFields = {
      productId: Number.parseInt(productId),
      productStock: Number.parseInt(productStock),
      productPrice: Number.parseFloat(productPrice),
      productWh: productWh ? Number.parseFloat(productWh) : null,
      productMrp: productMrp ? Number.parseFloat(productMrp) : null,
    }

    if (isNaN(numericFields.productId) || isNaN(numericFields.productStock) || isNaN(numericFields.productPrice)) {
      return res.status(400).json({
        success: false,
        error: "Invalid numeric values provided",
      })
    }

    // Connect to MongoDB with timeout
    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
    const collection = db.collection("products")

    // Check if product ID already exists
    const existingProduct = await collection.findOne({ productId: numericFields.productId })
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: "Product ID already exists",
      })
    }

    // Convert buffer to base64 for Cloudinary
    const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`

    // Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "product-images",
      resource_type: "auto",
      transformation: [{ width: 800, height: 800, crop: "limit" }, { quality: "auto" }, { format: "auto" }],
    })

    // Prepare product data for MongoDB
    const productData = {
      productId: numericFields.productId,
      company: productCompany.trim(),
      name: productItem.trim(),
      stock: numericFields.productStock,
      price: numericFields.productPrice,
      wholesalePrice: numericFields.productWh,
      mrp: numericFields.productMrp,
      description: productDescription ? productDescription.trim() : "",
      imageUrl: cloudinaryResponse.secure_url,
      imagePublicId: cloudinaryResponse.public_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Save to MongoDB
    const result = await collection.insertOne(productData)

    res.json({
      success: true,
      message: "Product added successfully!",
      data: {
        id: result.insertedId,
        productId: numericFields.productId,
        imageUrl: cloudinaryResponse.secure_url,
        name: productItem,
      },
    })
  } catch (error) {
    console.error("Error:", error)

    // Handle specific MongoDB errors
    if (error.name === "MongoServerError") {
      return res.status(500).json({
        success: false,
        error: "Database connection failed. Please check if MongoDB is running.",
      })
    }

    // Handle Cloudinary errors
    if (error.message && error.message.includes("cloudinary")) {
      return res.status(500).json({
        success: false,
        error: "Image upload failed. Please check Cloudinary configuration.",
      })
    }

    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    })
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

// API endpoint to get all products
app.get("/api/products", async (req, res) => {
  let dbClient = null

  try {
    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
    const collection = db.collection("products")

    const products = await collection.find({}).sort({ createdAt: -1 }).toArray()

    res.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch products. Please check database connection.",
    })
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

// API endpoint to get single product
app.get("/api/products/:id", async (req, res) => {
  let dbClient = null

  try {
    const productId = Number.parseInt(req.params.id)

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      })
    }

    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
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
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    })
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

// API endpoint to update product stock
app.patch("/api/products/:id/stock", async (req, res) => {
  let dbClient = null

  try {
    const productId = Number.parseInt(req.params.id)
    const { stock } = req.body

    if (isNaN(productId) || isNaN(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID or stock value",
      })
    }

    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
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
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

// Add new API endpoints for orders collection after the existing product endpoints

// ===== ORDERS API ENDPOINTS =====
console.log("📋 Setting up Orders API endpoints...")

// Add debugging middleware for orders
app.use("/api/orders*", (req, res, next) => {
  console.log(`📋 Orders API called: ${req.method} ${req.path}`)
  next()
})

// API endpoint to get all seller requests (orders) - Enhanced with debugging
app.get("/api/orders", async (req, res) => {
  let dbClient = null
  console.log("🔍 Fetching orders from database...")

  try {
    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()
    console.log("✅ Connected to MongoDB for orders")

    const db = dbClient.db("gupta-electronics")
    const collection = db.collection("orders")

    // Check if collection exists and has data
    const count = await collection.countDocuments()
    console.log(`📊 Found ${count} orders in database`)

    const orders = await collection.find({}).sort({ createdAt: -1 }).toArray()
    console.log("📋 Orders fetched:", orders.length)

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    })
  } catch (error) {
    console.error("❌ Error fetching orders:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch seller requests. Please check database connection.",
      details: error.message,
    })
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

// Test endpoint to check orders collection
app.get("/api/orders/test", async (req, res) => {
  let dbClient = null

  try {
    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    const ordersCollection = db.collection("orders")
    const sampleOrder = await ordersCollection.findOne()
    const orderCount = await ordersCollection.countDocuments()

    res.json({
      success: true,
      message: "Orders collection test",
      data: {
        availableCollections: collectionNames,
        hasOrdersCollection: collectionNames.includes("orders"),
        orderCount: orderCount,
        sampleOrder: sampleOrder,
      },
    })
  } catch (error) {
    console.error("Error in test endpoint:", error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

// API endpoint to get single seller request
app.get("/api/orders/:id", async (req, res) => {
  let dbClient = null

  try {
    const { ObjectId } = await import("mongodb")
    const orderId = req.params.id

    // Check if it's a valid ObjectId
    if (!ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      })
    }

    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
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
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch order",
    })
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

// API endpoint to update seller request status
app.patch("/api/orders/:id", async (req, res) => {
  let dbClient = null

  try {
    const { ObjectId } = await import("mongodb")
    const orderId = req.params.id
    const { Status, status, actionDate } = req.body

    // Check if it's a valid ObjectId
    if (!ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      })
    }

    // Use Status (capital S) to match your data structure, but also accept status for backward compatibility
    const orderStatus = Status || status
    if (!orderStatus || !["accepted", "rejected", "pending"].includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'accepted', 'rejected', or 'pending'",
      })
    }

    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
    const collection = db.collection("orders")

    const updateData = {
      Status: orderStatus, // Use capital S to match your schema
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
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update order status",
    })
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

// API endpoint to create new seller request (optional - for testing)
app.post("/api/orders", async (req, res) => {
  let dbClient = null

  try {
    const { Name, Address, "Mobile Number": MobileNumber, Type, cart } = req.body

    // Validate required fields
    if (!Name) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      })
    }

    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
    const collection = db.collection("orders")

    // Prepare order data to match your structure
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
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    })
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

// API endpoint to create sample test orders
app.post("/api/orders/create-samples", async (req, res) => {
  let dbClient = null

  try {
    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
    const collection = db.collection("orders")

    // Sample orders data
    const sampleOrders = [
      {
        Name: "Nikhil Sharma",
        Address: "Jakhi Bigha",
        "Mobile Number": "6200484817",
        Type: "r",
        cart: [
          { id: "5", quantity: 2, price: 139.8 },
          { id: "3", quantity: 5, price: 174.5 },
        ],
        Status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        Name: "Rahul Kumar",
        Address: "Delhi",
        "Mobile Number": "9876543210",
        Type: "w",
        cart: [
          { id: "1", quantity: 10, price: 500 },
          { id: "2", quantity: 5, price: 250 },
        ],
        Status: "accepted",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        Name: "Priya Singh",
        Address: "Mumbai",
        "Mobile Number": "8765432109",
        Type: "r",
        cart: [{ id: "4", quantity: 3, price: 150 }],
        Status: "rejected",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Insert sample orders
    const result = await collection.insertMany(sampleOrders)

    res.json({
      success: true,
      message: `${result.insertedCount} sample orders created successfully!`,
      data: {
        insertedCount: result.insertedCount,
        insertedIds: result.insertedIds,
      },
    })
  } catch (error) {
    console.error("Error creating sample orders:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create sample orders",
    })
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

// API endpoint to reset orders collection with fresh dummy data
app.post("/api/orders/reset", async (req, res) => {
  let dbClient = null

  try {
    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
    const collection = db.collection("orders")

    // Drop existing collection
    try {
      await collection.drop()
      console.log("🗑️ Dropped existing orders collection")
    } catch (error) {
      console.log("ℹ️ Orders collection didn't exist, creating new one")
    }

    // Create fresh dummy data
    const freshDummyOrders = [
      {
        Name: "Nikhil Sharma",
        Address: "Jakhi Bigha, Patna",
        "Mobile Number": "6200484817",
        Type: "r",
        cart: [
          { id: 1, quantity: 2, price: 139.8 },
          { id: 2, quantity: 1, price: 45.99 },
        ],
        Status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        Name: "Rahul Kumar",
        Address: "Boring Road, Patna",
        "Mobile Number": "9876543210",
        Type: "w",
        cart: [
          { id: 3, quantity: 10, price: 500 },
          { id: 4, quantity: 5, price: 250 },
        ],
        Status: "accepted",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        Name: "Priya Singh",
        Address: "Kankarbagh, Patna",
        "Mobile Number": "8765432109",
        Type: "r",
        cart: [{ id: 5, quantity: 3, price: 89.97 }],
        Status: "rejected",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        Name: "Amit Gupta",
        Address: "Fraser Road, Patna",
        "Mobile Number": "7654321098",
        Type: "r",
        cart: [
          { id: 6, quantity: 1, price: 199.99 },
          { id: 7, quantity: 2, price: 79.98 },
        ],
        Status: "pending",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        Name: "Sunita Devi",
        Address: "Danapur, Patna",
        "Mobile Number": "6543210987",
        Type: "w",
        cart: [{ id: 8, quantity: 20, price: 1000 }],
        Status: "pending",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ]

    // Insert fresh dummy orders
    const result = await collection.insertMany(freshDummyOrders)

    res.json({
      success: true,
      message: `Orders collection reset successfully with ${result.insertedCount} fresh orders!`,
      data: {
        insertedCount: result.insertedCount,
        orders: freshDummyOrders.map((order) => ({
          name: order.Name,
          status: order.Status,
          items: order.cart.length,
        })),
      },
    })
  } catch (error) {
    console.error("Error resetting orders collection:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Failed to reset orders collection",
    })
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
})

console.log("✅ Orders API endpoints setup complete")

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File size too large. Maximum size is 5MB.",
      })
    }
  }

  console.error("Unhandled error:", error)
  res.status(500).json({
    success: false,
    error: error.message || "Something went wrong!",
  })
})

// Test MongoDB connection on startup
async function testDatabaseConnection() {
  let testClient = null
  try {
    console.log("🔄 Testing database connection...")
    testClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await testClient.connect()
    await testClient.db("gupta-electronics").admin().ping()
    console.log("✅ Database connection successful")
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    console.error("💡 Make sure MongoDB is running or check your connection string")
  } finally {
    if (testClient) {
      await testClient.close()
    }
  }
}

// Function to initialize orders collection with dummy data
async function initializeOrdersCollection() {
  let dbClient = null
  try {
    console.log("🔄 Checking orders collection...")
    dbClient = new MongoClient(requiredEnvVars.MONGODB_URI)
    await dbClient.connect()

    const db = dbClient.db("gupta-electronics")
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    const ordersCollection = db.collection("orders")
    const orderCount = await ordersCollection.countDocuments()

    if (!collectionNames.includes("orders") || orderCount === 0) {
      console.log("📋 Orders collection not found or empty. Creating with dummy data...")

      // Dummy orders data
      const dummyOrders = [
        {
          Name: "Nikhil Sharma",
          Address: "Jakhi Bigha, Patna",
          "Mobile Number": "6200484817",
          Type: "r",
          cart: [
            { id: 1, quantity: 2, price: 139.8 },
            { id: 2, quantity: 1, price: 45.99 },
          ],
          Status: "pending",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          Name: "Rahul Kumar",
          Address: "Boring Road, Patna",
          "Mobile Number": "9876543210",
          Type: "w",
          cart: [
            { id: 3, quantity: 10, price: 500 },
            { id: 4, quantity: 5, price: 250 },
            { id: 5, quantity: 3, price: 150 },
          ],
          Status: "accepted",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        },
        {
          Name: "Priya Singh",
          Address: "Kankarbagh, Patna",
          "Mobile Number": "8765432109",
          Type: "r",
          cart: [{ id: 6, quantity: 3, price: 89.97 }],
          Status: "rejected",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          Name: "Amit Gupta",
          Address: "Fraser Road, Patna",
          "Mobile Number": "7654321098",
          Type: "r",
          cart: [
            { id: 7, quantity: 1, price: 199.99 },
            { id: 8, quantity: 2, price: 79.98 },
          ],
          Status: "pending",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
        {
          Name: "Sunita Devi",
          Address: "Danapur, Patna",
          "Mobile Number": "6543210987",
          Type: "w",
          cart: [
            { id: 9, quantity: 20, price: 1000 },
            { id: 10, quantity: 15, price: 750 },
          ],
          Status: "accepted",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          Name: "Vikash Kumar",
          Address: "Rajendra Nagar, Patna",
          "Mobile Number": "5432109876",
          Type: "r",
          cart: [{ id: 11, quantity: 4, price: 120 }],
          Status: "pending",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          Name: "Meera Sharma",
          Address: "Patliputra Colony, Patna",
          "Mobile Number": "4321098765",
          Type: "r",
          cart: [
            { id: 12, quantity: 2, price: 159.98 },
            { id: 13, quantity: 1, price: 299.99 },
          ],
          Status: "rejected",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        },
        {
          Name: "Ravi Shankar",
          Address: "Ashok Nagar, Patna",
          "Mobile Number": "3210987654",
          Type: "w",
          cart: [
            { id: 14, quantity: 25, price: 1250 },
            { id: 15, quantity: 30, price: 900 },
          ],
          Status: "pending",
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        },
      ]

      // Insert dummy orders
      const result = await ordersCollection.insertMany(dummyOrders)
      console.log(`✅ Created orders collection with ${result.insertedCount} dummy orders`)
      console.log("📊 Order statuses:", {
        pending: dummyOrders.filter((o) => o.Status === "pending").length,
        accepted: dummyOrders.filter((o) => o.Status === "accepted").length,
        rejected: dummyOrders.filter((o) => o.Status === "rejected").length,
      })
    } else {
      console.log(`✅ Orders collection exists with ${orderCount} orders`)
    }
  } catch (error) {
    console.error("❌ Failed to initialize orders collection:", error.message)
  } finally {
    if (dbClient) {
      await dbClient.close()
    }
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📱 Frontend running on http://localhost:5174`)
  console.log(`🔧 Health check: http://localhost:${PORT}/api/health`)

  console.log("\n📋 Available API Endpoints:")
  console.log("  GET  /api/health - Server health check")
  console.log("  GET  /api/products - Get all products")
  console.log("  POST /api/products - Create new product")
  console.log("  GET  /api/orders - Get all orders")
  console.log("  GET  /api/orders/test - Test orders collection")
  console.log("  POST /api/orders - Create new order")
  console.log("  POST /api/orders/create-samples - Create sample orders")
  console.log("  GET  /api/orders/:id - Get single order")
  console.log("  PATCH /api/orders/:id - Update order status")
  console.log("  POST /api/orders/reset - Reset orders collection")

  // Test database connection
  await testDatabaseConnection()

  // Initialize orders collection with dummy data if needed
  await initializeOrdersCollection()

  console.log("\n🎉 Server initialization complete!")
})
