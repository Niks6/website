import "./style.css"
import { showProductsContainer } from "./homeCards" // Updated import path
import { updateCartValue } from "./updateCartValue" // Updated import path
import { getCartProduct } from "./getCartProduct" // Updated import path
let products = []
const API_BASE_URL = "http://localhost:3001/api"

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    const result = await response.json()

    if (result.success) {
      products = result.data
      return result.data
    } else {
      console.error("Failed to load products:", result.error)
    }
  } catch (error) {
    console.error("Error loading products:", error)
  }
}

async function onAppLoad() {
  const products = await loadProducts();
  console.log("Products loaded:", products);
  showProductsContainer(products, 0);

  const valLocalStorage = getCartProduct();
  updateCartValue(valLocalStorage);
}

document.addEventListener("DOMContentLoaded", onAppLoad);

//This code is for Hamburger
document.getElementById("hamburger").addEventListener("click", (event) => {
  event.stopPropagation()
  const menu = document.getElementById("navbar-menu")
  menu.classList.toggle("active")
})

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.getElementById("navbar-menu").classList.remove("active")
  })
})

document.addEventListener("click", (event) => {
  const menu = document.getElementById("navbar-menu")
  const hamburger = document.getElementById("hamburger")

  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove("active")
  }
})

//this code is for slide show
let currentSlideIndex = 0
const slides = document.querySelectorAll(".slide")
const dots = document.querySelectorAll(".dot")
const totalSlides = slides.length
let autoSlideInterval

function showSlide(index) {
  slides.forEach((slide) => slide.classList.remove("active"))
  dots.forEach((dot) => dot.classList.remove("active"))

  slides[index].classList.add("active")
  dots[index].classList.add("active")

  const progressBar = document.querySelector(".progress-bar")
  progressBar.style.animation = "none"
  progressBar.offsetHeight // Trigger reflow
  progressBar.style.animation = "progress 3s linear infinite"
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % totalSlides
  showSlide(currentSlideIndex)
}

window.changeSlide = (direction) => {
  currentSlideIndex = (currentSlideIndex + direction + totalSlides) % totalSlides
  showSlide(currentSlideIndex)
  resetAutoSlide()
}
function currentSlide(index) {
  currentSlideIndex = index - 1
  showSlide(currentSlideIndex)
  resetAutoSlide()
}

function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 3000)
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval)
  startAutoSlide()
}

showSlide(currentSlideIndex)
startAutoSlide()

const sliderContainer = document.querySelector(".slider-container")
sliderContainer.addEventListener("mouseenter", () => {
  clearInterval(autoSlideInterval)
})

sliderContainer.addEventListener("mouseleave", () => {
  startAutoSlide()
})
