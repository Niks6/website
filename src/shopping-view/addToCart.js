import { getCartProduct } from "./getCartProduct"
import { showToast } from "./showToast" // Assuming this file exists
import { updateCartValue } from "./updateCartValue"

export const addToCart = (event, productId, stock, price) => {
  // Changed 'id' to 'productId'
  const valLocalStorage = getCartProduct()

  const currElement = document.querySelector(`#card${productId}`) // Use productId
  const quantity = Number.parseInt(currElement.querySelector(".qty-value").innerText, 10)
  const p = price * quantity

  const idStr = String(productId) // Use productId

  const existing = valLocalStorage.find((item) => String(item.productId) === idStr) // Check for productId
  if (existing) {
    existing.quantity = quantity
    existing.price = p
  } else {
    valLocalStorage.push({ productId: idStr, quantity, price: p }) // Store productId
  }

  // Save updated cart
  localStorage.setItem("cartProductLS", JSON.stringify(valLocalStorage))

  updateCartValue(valLocalStorage)
  showToast("add", String(productId)) // Use productId
}
