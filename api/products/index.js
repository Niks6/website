import { getDatabase } from "../_lib/mongodb.js"
import { cloudinary } from "../_lib/cloudinary.js"
import { handleCors } from "../_lib/cors.js"
import formidable from "formidable"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return

  try {
    if (req.method === "GET") {
      return await getProducts(req, res)
    } else if (req.method === "POST") {
      return await createProduct(req, res)
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

async function getProducts(req, res) {
  const db = await getDatabase()
  const collection = db.collection("products")

  const products = await collection.find({}).sort({ createdAt: -1 }).toArray()

  res.json({
    success: true,
    data: products,
  })
}

async function createProduct(req, res) {
  const form = formidable({
    maxFileSize: 5 * 1024 * 1024, // 5MB
  })

  const [fields, files] = await form.parse(req)

  const {
    productId,
    productCompany,
    productItem,
    productStock,
    productPrice,
    productWh,
    productMrp,
    productDescription,
  } = fields

  const imageFile = files.productImage?.[0]

  // Validate required fields
  if (!productId || !productCompany || !productItem || !productStock || !productPrice || !imageFile) {
    return res.status(400).json({
      success: false,
      error: "Product ID, Company, Name, Stock, Price, and Image are required",
    })
  }

  // Validate numeric fields
  const numericFields = {
    productId: Number.parseInt(productId[0]),
    productStock: Number.parseInt(productStock[0]),
    productPrice: Number.parseFloat(productPrice[0]),
    productWh: productWh?.[0] ? Number.parseFloat(productWh[0]) : null,
    productMrp: productMrp?.[0] ? Number.parseFloat(productMrp[0]) : null,
  }

  if (isNaN(numericFields.productId) || isNaN(numericFields.productStock) || isNaN(numericFields.productPrice)) {
    return res.status(400).json({
      success: false,
      error: "Invalid numeric values provided",
    })
  }

  const db = await getDatabase()
  const collection = db.collection("products")

  // Check if product ID already exists
  const existingProduct = await collection.findOne({ productId: numericFields.productId })
  if (existingProduct) {
    return res.status(400).json({
      success: false,
      error: "Product ID already exists",
    })
  }

  // Upload to Cloudinary
  const cloudinaryResponse = await cloudinary.uploader.upload(imageFile.filepath, {
    folder: "product-images",
    resource_type: "auto",
    transformation: [{ width: 800, height: 800, crop: "limit" }, { quality: "auto" }, { format: "auto" }],
  })

  // Prepare product data for MongoDB
  const productData = {
    productId: numericFields.productId,
    company: productCompany[0].trim(),
    name: productItem[0].trim(),
    stock: numericFields.productStock,
    price: numericFields.productPrice,
    wholesalePrice: numericFields.productWh,
    mrp: numericFields.productMrp,
    description: productDescription?.[0] ? productDescription[0].trim() : "",
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
      name: productItem[0],
    },
  })
}
