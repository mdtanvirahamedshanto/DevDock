document.addEventListener('DOMContentLoaded', () => {
  // --- Dark Mode Toggle ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
  const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

  // Check initial theme
  if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
  } else {
      document.documentElement.classList.remove('dark');
      if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');

        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }
        } else {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }
    });
  }

  // --- Sticky Navbar & Scroll Effects ---
  const header = document.getElementById('main-header');
  const scrollThreshold = 20;

  window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('shadow-md', 'bg-background/80', 'backdrop-blur-md');
      header.classList.remove('bg-transparent');
    } else {
      header.classList.remove('shadow-md', 'bg-background/80', 'backdrop-blur-md');
      header.classList.add('bg-transparent');
    }
  });

  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // --- Intersection Observer for Scroll Animations ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // --- Accordion Logic ---
  const accordions = document.querySelectorAll('.accordion-trigger');
  
  accordions.forEach(accordion => {
    accordion.addEventListener('click', () => {
      const content = accordion.nextElementSibling;
      const isOpen = content.classList.contains('is-open');

      // Close all other accordions (optional, but standard for professional FAQs)
      document.querySelectorAll('.accordion-content').forEach(c => {
        if (c !== content) c.classList.remove('is-open');
      });

      // Toggle current accordion
      content.classList.toggle('is-open');
      
      // Update icons for all
      document.querySelectorAll('.accordion-trigger').forEach(t => {
        if (t === accordion && !isOpen) {
          t.classList.add('is-open');
        } else {
          t.classList.remove('is-open');
        }
      });
    });
  });
});
