import { getCartProduct } from "./getCartProduct"
import { showATCT } from "./showATCT"

export const increDecre = (event, productId, stock, fallbackPrice) => {
  // Changed 'id' to 'productId'
  const cartProduct = getCartProduct()

  const currCardElement = document.querySelector(`#card${productId}`) // Use productId
  const quantityInput = currCardElement.querySelector(".quantity-input")
  const itemTotal = currCardElement.querySelector(".item-total")

  let quantity = 1
  let unitPrice = fallbackPrice

  const existingProduct = cartProduct.find((currProduct) => currProduct.productId == productId) // Check for productId

  if (existingProduct) {
    quantity = existingProduct.quantity || 1
    unitPrice = existingProduct.price / quantity
  }

  if (event.target.classList.contains("increase-btn")) {
    if (quantity < stock) {
      quantity += 1
    }
  }

  if (event.target.classList.contains("decrease-btn")) {
    if (quantity > 1) {
      quantity -= 1
    }
  }

  const totalPrice = unitPrice * quantity

  quantityInput.textContent = quantity
  itemTotal.textContent = `₹${totalPrice.toFixed(2)}`

  const updatedCart = cartProduct.map((product) => {
    if (product.productId == productId) {
      // Check for productId
      return {
        ...product,
        quantity: quantity,
        price: totalPrice,
      }
    }
    return product
  })

  localStorage.setItem("cartProductLS", JSON.stringify(updatedCart))
  showATCT()
}
