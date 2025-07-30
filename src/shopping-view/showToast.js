export const showToast = (action, productId = "") => {
  // Changed 'id' to 'productId'
  let message = ""

  switch (action) {
    case "delete":
      message = `Item with ID ${productId} deleted from cart.`
      break
    case "add":
      message = `Item with ID ${productId} added to cart.`
      break
    case "update":
      message = `Item with ID ${productId} updated in cart.`
      break
    default:
      message = "Action performed."
  }

  const toast = document.createElement("div")
  toast.className = "toast"
  toast.innerText = message

  document.body.appendChild(toast)

  // Remove toast after animation ends
  setTimeout(() => {
    toast.remove()
  }, 3000)
}
