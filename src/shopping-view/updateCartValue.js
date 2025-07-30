const cartValue = document.querySelector(".fa-solid")

export const updateCartValue = (cartProducts) => {
  return (cartValue.innerText = cartProducts.length)
}
