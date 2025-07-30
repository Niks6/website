import { getCartProduct } from "./getCartProduct" // Updated import path
import { showATCT } from "./showATCT" // Updated import path
import { showToast } from "./showToast" // Updated import path
import { updateCartValue } from "./updateCartValue" // Updated import path

export const removeProductCart = (productId) => {
  // Changed 'id' to 'productId'
  let cartProduct = getCartProduct()

  cartProduct = cartProduct.filter((currProduct) => currProduct.productId != productId) // Filter by productId
  localStorage.setItem("cartProductLS", JSON.stringify(cartProduct))

  const removeDiv = document.getElementById(`card${String(productId)}`) // Use productId
  if (removeDiv) {
    removeDiv.remove()
    showToast("delete", productId) // Use productId
  }

  showATCT()
  updateCartValue(cartProduct)
}
