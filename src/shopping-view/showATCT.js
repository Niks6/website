import { getCartProduct } from "./getCartProduct"

export const showATCT = () => {
  const subtotal = document.querySelector("#subtotal")
  const total = document.querySelector("#total")
  const tax = document.querySelector("#tax")
  const discount = document.querySelector("#discount")

  const cartProduct = getCartProduct()
  const initialValue = 0

  const totalPrice = cartProduct.reduce((accum, currEle) => {
    const productPrice = Number.parseInt(currEle.price) || 0
    return accum + productPrice
  }, initialValue)

  subtotal.textContent = `₹${totalPrice.toFixed(2)}`
  tax.textContent = `₹${((totalPrice * 18) / 100).toFixed(2)}`
  discount.textContent = `-₹${((totalPrice * 18) / 100).toFixed(2)}`
  total.textContent = `₹${(totalPrice + (totalPrice * 18) / 100 - (totalPrice * 18) / 100).toFixed(2)}`
}
