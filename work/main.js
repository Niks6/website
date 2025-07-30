// Application State
let activeTab = "dashboard"
let products = []
// Update the sellerRequests array to be loaded from database
let sellerRequests = []
let invoiceItems = [{ product: "", quantity: "", price: "" }]
let offers = []

// Update the API Configuration section
const API_BASE_URL = "http://localhost:3001/api"

// Utility Functions
function showMessage(text, type) {
  const messageContainer = document.getElementById("message-container")
  if (messageContainer) {
    messageContainer.textContent = text
    messageContainer.className = `message-container message-${type}`
    messageContainer.style.display = "block"

    if (type === "success") {
      setTimeout(() => {
        messageContainer.style.display = "none"
      }, 5000)
    }
  }
}

function hideMessage() {
  const messageContainer = document.getElementById("message-container")
  if (messageContainer) {
    messageContainer.style.display = "none"
  }
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Navigation Functions
function switchTab(tabName) {
  // Update active nav item
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.add("hidden")
  })

  // Show selected tab
  document.getElementById(`${tabName}-tab`).classList.remove("hidden")
  activeTab = tabName

  // Render content for the active tab
  renderTabContent()
}

// Product Management Functions
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    const result = await response.json()

    if (result.success) {
      products = result.data
      renderTabContent()
      updateDashboardStats()
      return result.data
    } else {
      console.error("Failed to load products:", result.error)
    }
  } catch (error) {
    console.error("Error loading products:", error)
  }
}

async function addProduct() {
  const productIdInput = document.getElementById("product-id")
  const productImageInput = document.getElementById("product-image")
  const productCompanyInput = document.getElementById("product-company")
  const productItemInput = document.getElementById("product-item")
  const productStockInput = document.getElementById("product-stock")
  const productPriceInput = document.getElementById("product-price")
  const productWhInput = document.getElementById("product-wh")
  const productMrpInput = document.getElementById("product-mrp")
  const productDescriptionInput = document.getElementById("product-description")

  // Validate required fields
  if (
    !productIdInput.value ||
    !productCompanyInput.value ||
    !productItemInput.value ||
    !productStockInput.value ||
    !productPriceInput.value ||
    !productImageInput.files[0]
  ) {
    showMessage("Please fill in all required fields (ID, Company, Name, Stock, Price, and Image)", "error")
    return
  }

  // Create FormData object
  const formData = new FormData()
  formData.append("productId", productIdInput.value)
  formData.append("productImage", productImageInput.files[0])
  formData.append("productCompany", productCompanyInput.value)
  formData.append("productItem", productItemInput.value)
  formData.append("productStock", productStockInput.value)
  formData.append("productPrice", productPriceInput.value)
  formData.append("productWh", productWhInput.value)
  formData.append("productMrp", productMrpInput.value)
  formData.append("productDescription", productDescriptionInput.value)

  // Show loading state
  const submitButton = document.getElementById("add-product-btn")
  submitButton.disabled = true
  submitButton.textContent = "Adding Product..."
  hideMessage()

  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (result.success) {
      showMessage(result.message, "success")
      clearProductForm()
      await loadProducts() // Reload products
    } else {
      showMessage(result.error, "error")
    }
  } catch (error) {
    console.error("Error:", error)
    showMessage("Network error. Please check if the server is running.", "error")
  } finally {
    submitButton.disabled = false
    submitButton.innerHTML = `
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
      Add Product
    `
  }
}

function clearProductForm() {
  document.getElementById("product-id").value = ""
  document.getElementById("product-image").value = ""
  document.getElementById("product-company").value = ""
  document.getElementById("product-item").value = ""
  document.getElementById("product-stock").value = ""
  document.getElementById("product-price").value = ""
  document.getElementById("product-wh").value = ""
  document.getElementById("product-mrp").value = ""
  document.getElementById("product-description").value = ""
}

function renderProductsTable() {
  const tbody = document.getElementById("products-table")
  const searchTerm = document.getElementById("product-search")?.value.toLowerCase() || ""

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm) || product.company.toLowerCase().includes(searchTerm),
  )

  tbody.innerHTML = filteredProducts
    .map(
      (product) => `
        <tr>
          <td><img src="${product.imageUrl}" alt="${product.name}" /></td>
          <td>${escapeHtml(product.name)}</td>
          <td>${escapeHtml(product.company)}</td>
          <td>$${product.price.toFixed(2)}</td>
          <td>
            <span class="badge ${product.stock < 15 ? "badge-danger" : "badge-success"}">
              ${product.stock}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="editProduct(${product.productId})">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.productId})">
              Delete
            </button>
          </td>
        </tr>
      `,
    )
    .join("")
}

function renderRecentProductsTable() {
  const tbody = document.getElementById("recent-products-table")
  const recentProducts = products.slice(0, 5) // Show only 5 recent products

  tbody.innerHTML = recentProducts
    .map(
      (product) => `
        <tr>
          <td>${escapeHtml(product.name)}</td>
          <td>
            <span class="badge ${product.stock < 15 ? "badge-danger" : "badge-success"}">
              ${product.stock}
            </span>
          </td>
          <td>$${product.price.toFixed(2)}</td>
        </tr>
      `,
    )
    .join("")
}

// Stock Management Functions
function renderStockList() {
  const stockList = document.getElementById("stock-list")
  const searchTerm = document.getElementById("stock-search")?.value.toLowerCase() || ""

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm) || product.company.toLowerCase().includes(searchTerm),
  )

  stockList.innerHTML = filteredProducts
    .map(
      (product) => `
        <div class="stock-item">
          <div class="stock-info">
            <h4>${escapeHtml(product.name)}</h4>
            <p>Current Stock: ${product.stock}</p>
            <p>Company: ${escapeHtml(product.company)}</p>
          </div>
          <div class="stock-controls">
            <input type="number" class="stock-input" id="stock-${product.productId}" placeholder="New stock" min="0">
            <button class="btn btn-primary btn-sm" onclick="updateStock(${product.productId})">
              Update
            </button>
          </div>
        </div>
      `,
    )
    .join("")
}

async function updateStock(productId) {
  const newStock = Number.parseInt(document.getElementById(`stock-${productId}`).value)

  if (isNaN(newStock) || newStock < 0) {
    alert("Please enter a valid stock quantity")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/stock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stock: newStock }),
    })

    const result = await response.json()

    if (result.success) {
      alert("Stock updated successfully!")
      document.getElementById(`stock-${productId}`).value = ""
      await loadProducts() // Reload products
    } else {
      alert("Failed to update stock: " + result.error)
    }
  } catch (error) {
    console.error("Error updating stock:", error)
    alert("Network error. Please check if the server is running.")
  }
}

// Searchable Dropdown Functions
function createSearchableDropdown(containerId, itemIndex) {
  const container = document.getElementById(containerId)
  if (!container) return

  const dropdownHtml = `
    <div class="searchable-dropdown" id="dropdown-${itemIndex}">
      <div class="dropdown-input-container">
        <input 
          type="text" 
          class="form-input dropdown-search" 
          placeholder="Search products..." 
          id="search-${itemIndex}"
          autocomplete="off"
        >
        <div class="dropdown-arrow">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
      </div>
      <div class="dropdown-options" id="options-${itemIndex}">
        <!-- Options will be populated here -->
      </div>
    </div>
  `

  container.innerHTML = dropdownHtml

  const searchInput = document.getElementById(`search-${itemIndex}`)
  const optionsContainer = document.getElementById(`options-${itemIndex}`)

  // Populate initial options
  updateDropdownOptions(itemIndex, "")

  // Add event listeners
  searchInput.addEventListener("input", (e) => {
    updateDropdownOptions(itemIndex, e.target.value)
    showDropdownOptions(itemIndex)
  })

  searchInput.addEventListener("focus", () => {
    showDropdownOptions(itemIndex)
  })

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      hideDropdownOptions(itemIndex)
    }
  })
}

function updateDropdownOptions(itemIndex, searchTerm) {
  const optionsContainer = document.getElementById(`options-${itemIndex}`)
  if (!optionsContainer) return

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.company.toLowerCase().includes(searchLower) ||
      product.productId.toString().includes(searchLower)
    )
  })

  if (filteredProducts.length === 0) {
    optionsContainer.innerHTML = '<div class="dropdown-option no-results">No products found</div>'
    return
  }

  optionsContainer.innerHTML = filteredProducts
    .map(
      (product) => `
      <div class="dropdown-option" data-product-id="${product.productId}" data-item-index="${itemIndex}">
        <div class="option-content">
          <div class="option-main">
            <span class="option-name">${escapeHtml(product.name)}</span>
            <span class="option-price">$${product.price.toFixed(2)}</span>
          </div>
          <div class="option-details">
            <span class="option-company">${escapeHtml(product.company)}</span>
            <span class="option-stock ${product.stock < 15 ? "low-stock" : ""}">Stock: ${product.stock}</span>
          </div>
        </div>
      </div>
    `,
    )
    .join("")

  // Add click event listeners to each option
  const options = optionsContainer.querySelectorAll(".dropdown-option:not(.no-results)")
  options.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      const productId = Number.parseInt(option.getAttribute("data-product-id"))
      const itemIndex = Number.parseInt(option.getAttribute("data-item-index"))
      const product = products.find((p) => p.productId === productId)

      if (product) {
        selectProduct(itemIndex, productId, product.name, product.price)
      }
    })
  })
}

function selectProduct(itemIndex, productId, productName, productPrice) {
  const searchInput = document.getElementById(`search-${itemIndex}`)
  if (searchInput) {
    searchInput.value = productName
  }

  // Update the invoice item
  invoiceItems[itemIndex].product = productId

  // Trigger quantity calculation if quantity exists
  if (invoiceItems[itemIndex].quantity) {
    updateInvoiceItem(itemIndex, "product", productId)
  }

  // Hide dropdown
  hideDropdownOptions(itemIndex)

  // Re-render to update the price field
  setTimeout(() => {
    calculateInvoiceTotal()
  }, 100)
}

function showDropdownOptions(itemIndex) {
  const optionsContainer = document.getElementById(`options-${itemIndex}`)
  if (optionsContainer) {
    optionsContainer.style.display = "block"
  }
}

function hideDropdownOptions(itemIndex) {
  const optionsContainer = document.getElementById(`options-${itemIndex}`)
  if (optionsContainer) {
    optionsContainer.style.display = "none"
  }
}

// Invoice Management Functions
function renderInvoiceItems() {
  const container = document.getElementById("invoice-items")
  container.innerHTML = invoiceItems
    .map(
      (item, index) => `
        <div class="invoice-item">
          <div id="product-dropdown-${index}"></div>
          <input type="number" placeholder="Quantity" class="form-input" 
                 value="${item.quantity}" onchange="updateInvoiceItem(${index}, 'quantity', this.value)" min="1">
          <input type="number" placeholder="Price" class="form-input" 
                 value="${item.price}" onchange="updateInvoiceItem(${index}, 'price', this.value)" step="0.01" readonly>
          <button class="btn btn-danger btn-sm" onclick="removeInvoiceItem(${index})">Remove</button>
        </div>
      `,
    )
    .join("")

  // Create searchable dropdowns for each item
  invoiceItems.forEach((item, index) => {
    createSearchableDropdown(`product-dropdown-${index}`, index)

    // Set the selected product if it exists
    if (item.product) {
      const product = products.find((p) => p.productId == item.product)
      if (product) {
        const searchInput = document.getElementById(`search-${index}`)
        if (searchInput) {
          searchInput.value = product.name
        }
      }
    }
  })

  calculateInvoiceTotal()
}

function addInvoiceItem() {
  invoiceItems.push({ product: "", quantity: "", price: "" })
  renderInvoiceItems()
}

function removeInvoiceItem(index) {
  invoiceItems.splice(index, 1)
  renderInvoiceItems()
}

function updateInvoiceItem(index, field, value) {
  invoiceItems[index][field] = value

  // Auto-calculate price when product or quantity changes
  if (field === "product" || field === "quantity") {
    const productId = invoiceItems[index].product
    const quantity = Number.parseInt(invoiceItems[index].quantity) || 0
    const product = products.find((p) => p.productId == productId)

    if (product && quantity > 0) {
      const priceType = document.querySelector('input[name="type"]:checked').value
      const unitPrice = priceType === "w" ? product.wholesalePrice || product.price : product.price
      invoiceItems[index].price = (unitPrice * quantity).toFixed(2)
    } else {
      invoiceItems[index].price = ""
    }

    calculateInvoiceTotal()
  } else {
    calculateInvoiceTotal()
  }
}

function calculateInvoiceTotal() {
  const total = invoiceItems.reduce((sum, item) => {
    return sum + Number.parseFloat(item.price || 0)
  }, 0)
  document.getElementById("invoice-total").textContent = total.toFixed(2)
}

async function generateInvoice() {
  const customerName = document.getElementById("customer-name").value
  const customerAddress = document.getElementById("customer-add").value
  const customerMobile = document.getElementById("customer-mno").value
  const total = Number.parseFloat(document.getElementById("invoice-total").textContent)

  if (!customerName || !customerAddress || !customerMobile || total <= 0) {
    alert("Please fill in all customer details and add items to the invoice.")
    return
  }

  // Validate stock availability before generating invoice
  const stockErrors = []
  const validItems = invoiceItems.filter((item) => item.product && item.quantity && item.price)

  for (const item of validItems) {
    const product = products.find((p) => p.productId == item.product)
    const requestedQuantity = Number.parseInt(item.quantity)

    if (product && product.stock < requestedQuantity) {
      stockErrors.push(`${product.name}: Only ${product.stock} items available, but ${requestedQuantity} requested`)
    }
  }

  if (stockErrors.length > 0) {
    alert("Insufficient stock for the following items:\n\n" + stockErrors.join("\n"))
    return
  }

  try {
    // Update stock levels for each item
    const stockUpdatePromises = validItems.map(async (item) => {
      const product = products.find((p) => p.productId == item.product)
      const requestedQuantity = Number.parseInt(item.quantity)

      if (product) {
        const newStock = product.stock - requestedQuantity

        const response = await fetch(`${API_BASE_URL}/products/${product.productId}/stock`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stock: newStock }),
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(`Failed to update stock for ${product.name}: ${result.error}`)
        }

        return { productName: product.name, oldStock: product.stock, newStock: newStock, quantity: requestedQuantity }
      }
    })

    // Wait for all stock updates to complete
    const stockUpdates = await Promise.all(stockUpdatePromises)

    // Generate invoice content with stock update information
    const invoiceContent = `
INVOICE
=======

Customer Details:
Name: ${customerName}
Address: ${customerAddress}
Mobile: ${customerMobile}
Date: ${new Date().toLocaleDateString()}
Invoice ID: INV-${Date.now()}

Items:
${validItems
  .map((item) => {
    const product = products.find((p) => p.productId == item.product)
    const unitPrice = (Number.parseFloat(item.price) / Number.parseInt(item.quantity)).toFixed(2)
    return `${product ? product.name : "Unknown"} x ${item.quantity} @ $${unitPrice} = $${item.price}`
  })
  .join("\n")}

Total: $${total.toFixed(2)}

Stock Updates:
${stockUpdates
  .map((update) => `${update.productName}: ${update.oldStock} → ${update.newStock} (Sold: ${update.quantity})`)
  .join("\n")}

Thank you for your business!
    `.trim()

    // Create and download invoice
    const blob = new Blob([invoiceContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice_${customerName.replace(/\s+/g, "_")}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Reset form
    document.getElementById("customer-name").value = ""
    document.getElementById("customer-add").value = ""
    document.getElementById("customer-mno").value = ""
    invoiceItems = [{ product: "", quantity: "", price: "" }]
    renderInvoiceItems()

    // Reload products to reflect updated stock levels
    await loadProducts()

    // Show success message with stock update details
    const stockUpdateSummary = stockUpdates
      .map((update) => `• ${update.productName}: ${update.oldStock} → ${update.newStock}`)
      .join("\n")

    alert(`Invoice generated successfully!\n\nStock levels updated:\n${stockUpdateSummary}`)
  } catch (error) {
    console.error("Error generating invoice:", error)
    alert(`Error generating invoice: ${error.message}\n\nPlease try again or check your connection.`)
  }
}

// Add new function to load seller requests from orders collection
async function loadSellerRequests() {
  try {
    console.log("🔄 Loading seller requests from API...")
    const response = await fetch(`${API_BASE_URL}/orders`)

    console.log("📡 API Response status:", response.status)

    if (!response.ok) {
      if (response.status === 404) {
        console.error("❌ Orders endpoint not found (404)")
        alert("Orders API endpoint not found. Please check if the server is running correctly.")
        sellerRequests = []
        return []
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("📋 API Response:", result)

    if (result.success) {
      sellerRequests = result.data || []
      console.log("✅ Loaded seller requests:", sellerRequests.length)
      renderTabContent()
      updateDashboardStats()
      return result.data
    } else {
      console.error("❌ Failed to load seller requests:", result.error)
      alert("Failed to load seller requests: " + (result.error || "Unknown error"))
      sellerRequests = []
    }
  } catch (error) {
    console.error("❌ Error loading seller requests:", error)

    // More specific error messages
    if (error.message.includes("fetch")) {
      alert("Cannot connect to server. Please check if the server is running on http://localhost:3001")
    } else if (error.message.includes("404")) {
      alert("Orders API endpoint not found. Please check server configuration.")
    } else {
      alert("Error loading seller requests: " + error.message)
    }

    sellerRequests = []
  }
}

// Add test function to check API connectivity
async function testApiConnection() {
  try {
    console.log("🧪 Testing API connection...")

    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log("✅ Health check passed:", healthData)
    }

    // Test orders endpoint specifically
    const ordersTestResponse = await fetch(`${API_BASE_URL}/orders/test`)
    if (ordersTestResponse.ok) {
      const testData = await ordersTestResponse.json()
      console.log("✅ Orders test passed:", testData)

      if (!testData.data.hasOrdersCollection) {
        console.warn("⚠️ Orders collection not found in database")
        alert("Orders collection not found in database. Please create some test orders first.")
      }
    }
  } catch (error) {
    console.error("❌ API connection test failed:", error)
  }
}

// Update the renderRequestsList function to include view button
function renderRequestsList() {
  const requestsList = document.getElementById("requests-list")

  if (!sellerRequests || sellerRequests.length === 0) {
    requestsList.innerHTML = '<div class="request-item"><p>No seller requests found.</p></div>'
    return
  }

  requestsList.innerHTML = sellerRequests
    .map((request) => {
      const cartItemCount = Array.isArray(request.cart) ? request.cart.length : 0
      const totalAmount = Array.isArray(request.cart)
        ? request.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        : 0

      return `
        <div class="request-item">
          <div class="request-header">
            <div class="request-info">
              <h4>${escapeHtml(request.Name || "Unknown Customer")}</h4>
              <p><strong>Order Type:</strong> ${request.Type === "r" ? "Retail" : request.Type === "w" ? "Wholesale" : "Unknown"}</p>
              <p><strong>Address:</strong> ${escapeHtml(request.Address || "N/A")}</p>
              <p><strong>Mobile:</strong> ${request["Mobile Number"] || "N/A"}</p>
              <p><strong>Items:</strong> ${cartItemCount} products</p>
              <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
              <p class="date"><strong>Order ID:</strong> ${request._id}</p>
            </div>
            <span class="badge ${
              request.Status === "pending"
                ? "badge-warning"
                : request.Status === "accepted"
                  ? "badge-success"
                  : "badge-danger"
            }">
              ${(request.Status || "pending").toUpperCase()}
            </span>
          </div>
          
          <div class="request-actions">
            ${
              request.Status === "pending"
                ? `
                <button class="btn btn-success btn-sm" onclick="handleOrderRequest('${request._id}', 'accepted')">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Accept
                </button>
                <button class="btn btn-danger btn-sm" onclick="handleOrderRequest('${request._id}', 'rejected')">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  Reject
                </button>
                <button class="btn btn-sm" style="background: #6b7280; color: white;" onclick="viewOrderDetails('${request._id}')">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  View Cart
                </button>
              `
                : request.Status === "accepted"
                  ? `
                  <button class="btn btn-primary btn-sm" onclick="downloadOrderRequest('${request._id}')">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Download
                  </button>
                  <button class="btn btn-sm" style="background: #6b7280; color: white;" onclick="viewOrderDetails('${request._id}')">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    View Details
                  </button>
                `
                  : `
                  <button class="btn btn-sm" style="background: #6b7280; color: white;" onclick="viewOrderDetails('${request._id}')">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    View Details
                  </button>
                `
            }
          </div>
        </div>
      `
    })
    .join("")
}

// Add new function to view order details with your data structure
function viewOrderDetails(orderId) {
  const order = sellerRequests.find((r) => r._id == orderId)
  if (!order) {
    alert("Order not found")
    return
  }

  // Calculate total amount from cart
  const totalAmount = Array.isArray(order.cart)
    ? order.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0

  // Generate cart items HTML with product details
  const cartItemsHtml =
    Array.isArray(order.cart) && order.cart.length > 0
      ? order.cart
          .map((item, index) => {
            const product = products.find((p) => p.productId == item.id)
            const unitPrice = item.quantity > 0 ? (item.price / item.quantity).toFixed(2) : "0.00"

            return `
            <div class="cart-item">
              <strong>Item ${index + 1}:</strong><br>
              <strong>Product ID:</strong> ${item.id}<br>
              <strong>Product Name:</strong> ${product ? escapeHtml(product.name) : "Unknown Product"}<br>
              <strong>Company:</strong> ${product ? escapeHtml(product.company) : "N/A"}<br>
              <strong>Quantity:</strong> ${item.quantity}<br>
              <strong>Unit Price:</strong> $${unitPrice}<br>
              <strong>Total Price:</strong> $${item.price.toFixed(2)}<br>
              <strong>Available Stock:</strong> ${product ? product.stock : "N/A"}
            </div>
          `
          })
          .join("")
      : '<div class="cart-item">No items in cart</div>'

  // Create modal content
  const modalContent = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Order Details - ${order.Status === "pending" ? "PENDING" : order.Status === "accepted" ? "ACCEPTED" : "REJECTED"}</h3>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <strong>Order ID:</strong>
              <span>${order._id}</span>
            </div>
            <div class="detail-item">
              <strong>Customer Name:</strong>
              <span>${escapeHtml(order.Name || "N/A")}</span>
            </div>
            <div class="detail-item">
              <strong>Address:</strong>
              <span>${escapeHtml(order.Address || "N/A")}</span>
            </div>
            <div class="detail-item">
              <strong>Mobile Number:</strong>
              <span>${order["Mobile Number"] || "N/A"}</span>
            </div>
            <div class="detail-item">
              <strong>Order Type:</strong>
              <span>${order.Type === "r" ? "Retail" : order.Type === "w" ? "Wholesale" : "Unknown"}</span>
            </div>
            <div class="detail-item">
              <strong>Status:</strong>
              <span class="badge ${
                order.Status === "pending"
                  ? "badge-warning"
                  : order.Status === "accepted"
                    ? "badge-success"
                    : "badge-danger"
              }">${(order.Status || "pending").toUpperCase()}</span>
            </div>
            <div class="detail-item">
              <strong>Total Items:</strong>
              <span>${Array.isArray(order.cart) ? order.cart.length : 0}</span>
            </div>
            <div class="detail-item">
              <strong>Total Amount:</strong>
              <span style="font-weight: bold; color: #059669;">$${totalAmount.toFixed(2)}</span>
            </div>
            <div class="detail-item full-width">
              <strong>Cart Items:</strong>
              <div class="cart-items">
                ${cartItemsHtml}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          ${
            order.Status === "pending"
              ? `
            <button class="btn btn-success" onclick="handleOrderRequest('${order._id}', 'accepted'); closeModal()">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Accept Order
            </button>
            <button class="btn btn-danger" onclick="handleOrderRequest('${order._id}', 'rejected'); closeModal()">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              Reject Order
            </button>
          `
              : order.Status === "accepted"
                ? `
            <button class="btn btn-primary" onclick="downloadOrderRequest('${order._id}'); closeModal()">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Download Order
            </button>
          `
                : ""
          }
          <button class="btn" style="background: #6b7280; color: white;" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `

  // Add modal to page
  const modalDiv = document.createElement("div")
  modalDiv.id = "request-modal"
  modalDiv.innerHTML = modalContent
  document.body.appendChild(modalDiv)
}

// Add function to close modal
function closeModal() {
  const modal = document.getElementById("request-modal")
  if (modal) {
    modal.remove()
  }
}

// Update handleRequest function to work with database
async function handleOrderRequest(orderId, action) {
  try {
    console.log(`Updating order ${orderId} to ${action}`) // Debug log

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Status: action,
        actionDate: new Date().toISOString(),
      }),
    })

    const result = await response.json()

    if (result.success) {
      alert(`Order ${action} successfully!`)
      await loadSellerRequests() // Reload requests
      updateDashboardStats() // Update dashboard stats
    } else {
      alert("Failed to update order: " + result.error)
    }
  } catch (error) {
    console.error("Error updating order:", error)
    alert("Network error. Please check if the server is running.")
  }
}

// Update the downloadOrderRequest function with better formatting
function downloadOrderRequest(orderId) {
  const order = sellerRequests.find((r) => r._id == orderId)
  if (!order) {
    alert("Order not found")
    return
  }

  const totalAmount = Array.isArray(order.cart)
    ? order.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0

  const cartDetails =
    Array.isArray(order.cart) && order.cart.length > 0
      ? order.cart
          .map((item, index) => {
            const product = products.find((p) => p.productId == item.id)
            const unitPrice = item.quantity > 0 ? (item.price / item.quantity).toFixed(2) : "0.00"

            return `${index + 1}. ${product ? product.name : "Unknown Product"} (ID: ${item.id})
   Company: ${product ? product.company : "N/A"}
   Quantity: ${item.quantity}
   Unit Price: $${unitPrice}
   Total: $${item.price.toFixed(2)}`
          })
          .join("\n\n")
      : "No items in cart"

  const content = `
ORDER DOCUMENT
==============

Order ID: ${order._id}
Status: ${(order.Status || "pending").toUpperCase()}
Date: ${new Date().toLocaleString()}

CUSTOMER INFORMATION:
--------------------
Name: ${order.Name || "N/A"}
Address: ${order.Address || "N/A"}
Mobile Number: ${order["Mobile Number"] || "N/A"}
Order Type: ${order.Type === "r" ? "Retail" : order.Type === "w" ? "Wholesale" : "Unknown"}

CART ITEMS:
-----------
${cartDetails}

ORDER SUMMARY:
--------------
Total Items: ${Array.isArray(order.cart) ? order.cart.length : 0}
Total Amount: $${totalAmount.toFixed(2)}

This document confirms that the above order has been ${order.Status || "processed"}.

Generated on: ${new Date().toLocaleString()}
  `.trim()

  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `order_${order._id}_${(order.Name || "customer").replace(/\s+/g, "_")}_${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  alert("Order document downloaded successfully!")
}

// Offers Management Functions
function addOffer() {
  const imageInput = document.getElementById("offer-image")
  const descInput = document.getElementById("offer-description")

  const file = imageInput.files[0]
  const description = descInput.value.trim()

  if (!file || !description) {
    alert("Please upload an image and add a description.")
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const offer = {
      id: Date.now(),
      imageUrl: e.target.result,
      description: description,
      createdAt: new Date().toISOString(),
    }

    offers.push(offer)
    renderOffersTable()

    // Clear input fields
    imageInput.value = ""
    descInput.value = ""
  }

  reader.readAsDataURL(file)
}

function renderOffersTable() {
  const tbody = document.getElementById("offers-table")
  tbody.innerHTML = offers
    .map(
      (offer) => `
      <tr>
        <td><img src="${offer.imageUrl}" alt="Offer" style="width: 100px; height: auto; border-radius: 5px;"></td>
        <td>${escapeHtml(offer.description)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="removeOffer(${offer.id})">
            Remove
          </button>
        </td>
      </tr>
    `,
    )
    .join("")
}

function removeOffer(offerId) {
  offers = offers.filter((offer) => offer.id !== offerId)
  renderOffersTable()
}

// Dashboard Stats Functions
function updateDashboardStats() {
  document.getElementById("total-products").textContent = products.length
  document.getElementById("pending-requests").textContent = sellerRequests.filter((r) => r.Status === "pending").length
  document.getElementById("low-stock-items").textContent = products.filter((p) => p.stock < 15).length

  // Calculate total revenue from accepted orders
  const totalRevenue = sellerRequests
    .filter((order) => order.Status === "accepted" && order.cart)
    .reduce((sum, order) => {
      const orderTotal = order.cart.reduce((orderSum, item) => orderSum + item.price * item.quantity, 0)
      return sum + orderTotal
    }, 0)

  document.getElementById("total-revenue").textContent = `$${totalRevenue.toFixed(2)}`
}

// Render content based on active tab
function renderTabContent() {
  switch (activeTab) {
    case "dashboard":
      renderRecentProductsTable()
      break
    case "products":
      renderProductsTable()
      break
    case "stock":
      renderStockList()
      break
    case "invoice":
      renderInvoiceItems()
      break
    case "requests":
      renderRequestsList()
      break
    case "offer":
      renderOffersTable()
      break
  }
}

// Update the initialization to load seller requests
document.addEventListener("DOMContentLoaded", async () => {
  // Navigation event listeners
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const tabName = item.getAttribute("data-tab")
      switchTab(tabName)
    })
  })

  // Product form submission
  const addProductBtn = document.getElementById("add-product-btn")
  if (addProductBtn) {
    addProductBtn.addEventListener("click", addProduct)
  }

  // Search functionality
  const productSearch = document.getElementById("product-search")
  if (productSearch) {
    productSearch.addEventListener("input", renderProductsTable)
  }

  const stockSearch = document.getElementById("stock-search")
  if (stockSearch) {
    stockSearch.addEventListener("input", renderStockList)
  }

  // File validation
  const productImageInput = document.getElementById("product-image")
  if (productImageInput) {
    productImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showMessage("File size should be less than 5MB", "error")
          productImageInput.value = ""
          return
        }

        if (!file.type.startsWith("image/")) {
          showMessage("Please select a valid image file", "error")
          productImageInput.value = ""
          return
        }
      }
    })
  }

  // Test API connection first
  await testApiConnection()

  // Initialize the application
  await loadProducts()
  await loadSellerRequests() // Add this line
  updateDashboardStats()
  renderTabContent()
})

// Add global functions for modal and dropdown
window.viewOrderDetails = viewOrderDetails
window.handleOrderRequest = handleOrderRequest
window.downloadOrderRequest = downloadOrderRequest
window.selectProduct = selectProduct

// Keep the old function names for backward compatibility
window.viewRequestDetails = viewOrderDetails
window.handleRequest = handleOrderRequest
window.downloadRequest = downloadOrderRequest

// Global functions for HTML onclick handlers
window.switchTab = switchTab
window.addInvoiceItem = addInvoiceItem
window.removeInvoiceItem = removeInvoiceItem
window.updateInvoiceItem = updateInvoiceItem
window.generateInvoice = generateInvoice
window.updateStock = updateStock
window.addOffer = addOffer
window.removeOffer = removeOffer
window.editProduct = (id) => alert(`Edit product ${id} - Feature coming soon!`)
window.deleteProduct = (id) => alert(`Delete product ${id} - Feature coming soon!`)
