import { addToCart } from "./addToCart" // Updated import path
import { QuantityControl } from "./QuantityControl" // Updated import path

const pro_template = document.querySelector("#product-card-template")
const pro_container = document.querySelector(".pro-cards")

export const showProductsContainer = (products, home) => {
  if (!products) return

  // Clear existing products before adding new ones
  pro_container.innerHTML = ""

  if (home == 0) {
    products.slice(0, 6).forEach((element) => {
      const {
        _id,
        productId,
        company,
        name,
        stock,
        price,
        wholesalePrice,
        mrp,
        description,
        imageUrl,
        imagePublicId,
        createdAt,
        updatedAt,
      } = element

      const productClone = document.importNode(pro_template.content, true)
      productClone.querySelector("#cardID").setAttribute("id", `card${productId}`)
      productClone.querySelector(".product-title").textContent = name
      productClone.querySelector(".product-description").textContent = description
      productClone.querySelector(".product-category").textContent = company
      productClone.querySelector(".product-image img").src = imageUrl
      productClone.querySelector(".info-value").textContent = stock ? "In Stock" : "Out of Stock"
      productClone.querySelector(".current-price").textContent = `₹${price}`
      productClone.querySelector(".original-price").textContent = `₹${mrp}`

      //discount
      const dis = Math.round(((mrp - price) / mrp) * 100, 1)
      productClone.querySelector(".discount").textContent = `${dis}% OFF`

      // quantity control
      productClone.querySelector(".quantity-controls").addEventListener("click", (event) => {
        QuantityControl(event, productId, stock) // Use productId here
      })

      //add to cart
      productClone.querySelector(".action-buttons").addEventListener("click", (event) => {
        addToCart(event, productId, stock, price) // Use productId here
      })
      pro_container.append(productClone)
    })
  } else {
    products.forEach((element) => {
      const {
        _id,
        productId,
        company,
        name,
        stock,
        price,
        wholesalePrice,
        mrp,
        description,
        imageUrl,
        imagePublicId,
        createdAt,
        updatedAt,
      } = element

      const productClone = document.importNode(pro_template.content, true)
      productClone.querySelector("#cardID").setAttribute("id", `card${productId}`)
      productClone.querySelector(".product-title").textContent = name
      productClone.querySelector(".product-description").textContent = description
      productClone.querySelector(".product-category").textContent = company
      productClone.querySelector(".product-image img").src = imageUrl
      productClone.querySelector(".info-value").textContent = stock ? "In Stock" : "Out of Stock"
      productClone.querySelector(".current-price").textContent = `₹${price}`
      productClone.querySelector(".original-price").textContent = `₹${mrp}`

      //discount
      const dis = Math.round(((mrp - price) / mrp) * 100, 1)
      productClone.querySelector(".discount").textContent = `${dis}% OFF`

      // quantity control
      productClone.querySelector(".quantity-controls").addEventListener("click", (event) => {
        QuantityControl(event, productId, stock) // Use productId here
      })

      //add to cart
      productClone.querySelector(".action-buttons").addEventListener("click", (event) => {
        addToCart(event, productId, stock, price) // Use productId here
      })
      pro_container.append(productClone)
    })
  }
}
