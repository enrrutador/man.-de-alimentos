// === Manipulación Segura de Alimentos - JavaScript ===

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  hamburger?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
  
  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navMenu?.classList.remove('active');
    });
  });
});

// Toggle module accordion
function toggleModule(header) {
  const content = header.nextElementSibling;
  const toggle = header.querySelector('.toggle');
  
  content.classList.toggle('active');
  toggle.textContent = content.classList.contains('active') ? '−' : '+';
}
