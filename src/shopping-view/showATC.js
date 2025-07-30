import { showHam } from "./hamburger";
import { getCartProduct } from "./getCartProduct";
import { fetchQualityFromCartLS } from "./fetchQualityFromCartLS";
import { removeProductCart } from "./removeProductCart"; // Assuming this file exists
import { increDecre } from "./increDecre";
import { showATCT } from "./showATCT";
import { updateCartValue } from "./updateCartValue";

const getCardProductLS = getCartProduct();
updateCartValue(getCardProductLS);
let products = [];
const API_BASE_URL = "http://localhost:3001/api";

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    const result = await response.json();

    if (result.success) {
      products = result.data;
      return result.data;
    } else {
      console.error("Failed to load products:", result.error);
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

async function onAppLoad() {
  const products = await loadProducts();
}

document.addEventListener("DOMContentLoaded", onAppLoad);


const filterProducts = products.filter((currProduct) => {
  return getCardProductLS.some(
    (currEle) => String(currProduct.productId) == String(currEle.productId)
  );
});

const productTemplate = document.querySelector("#cart-item-template");
const cartelement = document.querySelector(".cart-items");

const showCartProduct = () => {
  filterProducts.forEach((currProduct) => {
    const {
      _id,
      productId, // Use productId consistently
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
    } = currProduct;

    const productClone = document.importNode(productTemplate.content, true);

    const LsActualdata = fetchQualityFromCartLS(productId, price); // Pass productId

    productClone.querySelector(".item-title").textContent = name;
    productClone.querySelector(".item-specs").textContent = company;
    productClone
      .querySelector("#cardID")
      .setAttribute("id", `card${productId}`);
    productClone.querySelector(".item-price").textContent = `₹${price}`;
    productClone.querySelector(
      ".item-total"
    ).textContent = `₹${LsActualdata.price}`;
    productClone.querySelector(".item-image").src = imageUrl;
    productClone.querySelector(".quantity-input").textContent =
      LsActualdata.quantity;

    productClone
      .querySelector(".remove-btn")
      .addEventListener("click", () => removeProductCart(productId)); // Use productId

    productClone
      .querySelector(".quantity-controls")
      .addEventListener("click", (event) => {
        increDecre(event, productId, stock, price); // Pass productId
      });

    cartelement.appendChild(productClone);
  });
};







async function addProduct() {

  // Create FormData object
  const formData = new FormData();
  formData.append("productId", productIdInput.value);
  formData.append("productImage", productImageInput.files[0]);
  formData.append("productCompany", productCompanyInput.value);
  formData.append("productItem", productItemInput.value);
  formData.append("productStock", productStockInput.value);
  formData.append("productPrice", productPriceInput.value);
  formData.append("productWh", productWhInput.value);
  formData.append("productMrp", productMrpInput.value);
  formData.append("productDescription", productDescriptionInput.value);

  // Show loading state
  const submitButton = document.getElementById("add-product-btn");
  submitButton.disabled = true;
  submitButton.textContent = "Adding Product...";
  hideMessage();

  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      showMessage(result.message, "success");
      clearProductForm();
      await loadProducts(); // Reload products
    } else {
      showMessage(result.error, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage(
      "Network error. Please check if the server is running.",
      "error"
    );
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = `
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
      Add Product
    `;
  }
}

function renameProductIdToId(cartItems) {
  if (!Array.isArray(cartItems)) {
    console.warn("renameProductIdToId expected an array, but received:", cartItems)
    return cartItems
  }
  return cartItems.map((item) => {
    if (item && item.productId !== undefined) {
      const newItem = { ...item, id: item.productId } // Create a new object to avoid direct mutation
      delete newItem.productId
      return newItem
    }
    return item
  })
}

async function handleContactFormSubmit(event){
  event.preventDefault() // Prevent default form submission

  const element = document.getElementById("info-overlay")
  const name = document.getElementById("name").value
  const address = document.getElementById("address").value
  const phone = document.getElementById("phone").value

    const orderData = {
    Name: name,
    Address: address,
    "Mobile Number": phone,
    Type: "r",
    cart: renameProductIdToId(getCartProduct()), // cart is now directly the object/array
    Status: "pending",
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set Content-Type to JSON
      },
      body: JSON.stringify(orderData), // Stringify the object to JSON
    })

    const result = await response.json()
    if (result.success) {
      console.log("Order added successfully:", result.message)
    } else {
      console.error("Failed to add order:", result.error)
    }
  } catch (error) {
    console.error("Error:", error)
  } finally {
    console.log("Request completed")
  }

  // Close modal
  localStorage.removeItem("cartProductLS");
  closeModal();
}

const showPopUp = () => {
  const modalHTML = `<div class="modal-overlay" id="modalOverlay">
        <div class="modal">
            <button class="close-btn" onclick="closeModal()">&times;</button>
            <h2>Contact Information</h2>
            
            <form id="contactForm">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" >
                </div>

                <div class="form-group">
                    <label for="address">Address</label>
                    <textarea id="address" name="address" placeholder="Enter your complete address"></textarea>
                </div>

                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" placeholder="(123) 456-7890" >
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-cancel" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-submit">Continue</button>
                </div>
            </form>
        </div>
    </div>`;

  const element = document.createElement("div");
  element.id = "info-overlay";
  element.innerHTML = modalHTML;
  document.body.appendChild(element);

  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactFormSubmit)
  }
};

window.closeModal = () => {
  const element = document.getElementById("info-overlay");
  element.parentNode.removeChild(element);
};

const m = document.querySelector(".checkout-btn");
m.addEventListener("click", showPopUp);

showATCT();
showCartProduct();
showHam();
