import { getCartProduct } from "./getCartProduct" // Updated import path
import { showProductsContainer } from "./homeCards" // Updated import path
import { updateCartValue } from "./updateCartValue" // Updated import path

function debounce(func, delay) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), delay)
  }
}

const valLocalStorage = getCartProduct()
updateCartValue(valLocalStorage)

let products = []
const API_BASE_URL = "http://localhost:3001/api"

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    const result = await response.json()

    if (result.success) {
      products = result.data
      return result.data
    } else {
      console.error("Failed to load products:", result.error)
    }
  } catch (error) {
    console.error("Error loading products:", error)
  }
}

function loadSearchProduct() {
  const searchTerm = document.getElementById("product-search")?.value.toLowerCase() || ""

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm) || product.company.toLowerCase().includes(searchTerm),
  )

  showProductsContainer(filteredProducts, 1)
}

document.addEventListener("DOMContentLoaded", async () => {
  // Search functionality
  const productSearch = document.getElementById("product-search")
  if (productSearch) {
    const debouncedLoadSearchProduct = debounce(loadSearchProduct, 300) // 300ms debounce
    productSearch.addEventListener("input", debouncedLoadSearchProduct)
  }

  products = await loadProducts()
  // FIX: Uncomment this line to display products on initial load
  showProductsContainer(products, 1)
})
