export const showHam = () => {
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
}

