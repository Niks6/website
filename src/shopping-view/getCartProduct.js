export const getCartProduct = () => {
  const cartProducts = localStorage.getItem("cartProductLS")
  if (!cartProducts) {
    return []
  }

  return JSON.parse(cartProducts)
}
