import { getCartProduct } from "./getCartProduct";
import { updateCartValue } from "./updateCartValue";


let valLocalStorage = getCartProduct()
updateCartValue(valLocalStorage);

document.getElementById('hamburger').addEventListener('click', function (event) {
    event.stopPropagation(); // Prevent event bubbling
    const menu = document.getElementById('navbar-menu');
    menu.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function () {
        document.getElementById('navbar-menu').classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', function (event) {
    const menu = document.getElementById('navbar-menu');
    const hamburger = document.getElementById('hamburger');

    // Only close if click is outside both menu and hamburger
    if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
        menu.classList.remove('active');
    }
});



// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Observe sections for scroll animations
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });

    // Animate stats numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalNumber = stat.textContent;
        stat.textContent = '0';

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumber(stat, finalNumber);
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(stat);
    });
});

function animateNumber(element, target) {
    const duration = 2000;
    let current = 0;
    const isKm = target.includes('km');
    const numericTarget = parseInt(target.replace(/[^\d]/g, ''));
    const increment = Math.ceil(numericTarget / 100);

    const timer = setInterval(() => {
        current += increment;
        if (current >= numericTarget) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = isKm ? current + 'km' :
                current >= 1000 ? (current / 1000).toFixed(0) + 'k+' :
                    current + '+';
        }
    }, duration / 100);
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});