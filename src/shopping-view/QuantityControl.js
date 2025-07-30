export const QuantityControl = (event, productId, stock) => {
  // Changed 'id' to 'productId'
  const cardElement = document.querySelector(`#card${productId}`) // Use productId
  if (!cardElement) return

  const quantityElement = cardElement.querySelector(".qty-value") // Changed selector from '#quantity' to '.qty-value'
  if (!quantityElement) return

  let quantity = Number.parseInt(quantityElement.innerText) || 1 // Get quantity from innerText

  if (event.target.classList.contains("incre")) {
    if (quantity < stock) {
      quantity += 1
    }
  }

  if (event.target.classList.contains("decre")) {
    if (quantity > 1) {
      quantity -= 1
    }
  }

  quantityElement.innerText = quantity
  // Removed setAttribute('data-quantity') as it's not used
  return quantity
}
