import { getCartProduct } from "./getCartProduct"

export const fetchQualityFromCartLS = (productId, price) => {
  // Changed 'id' to 'productId'
  const localStorageData = getCartProduct()

  const existingProduct = localStorageData.find((currProduct) => currProduct.productId == productId) // Check for productId
  let quantity = 1

  if (existingProduct) {
    quantity = existingProduct.quantity
    price = existingProduct.price
  }

  return { quantity, price }
}
