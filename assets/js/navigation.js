/**
 * Course Navigation System
 * Handles module progress, navigation, and UI interactions
 */

// Course Data Structure
const courseData = {
  currentModule: 1,
  totalModules: 5,
  modules: [
    { id: 1, slug: 'modulo-1-fundamentos', title: 'Fundamentos de Manipulación de Alimentos', completed: false },
    { id: 2, slug: 'modulo-2-nutricion', title: 'Nutrición y Propiedades de los Alimentos', completed: false },
    { id: 3, slug: 'modulo-3-higiene', title: 'Higiene Personal e Instalaciones', completed: false },
    { id: 4, slug: 'modulo-4-conservacion', title: 'Conservación y Procesamiento', completed: false },
    { id: 5, slug: 'modulo-5-etiquetado', title: 'Etiquetado y Presentación', completed: false }
  ]
};

// Active Navigation State
const navState = {
  currentPage: '',
  currentModule: 0,
  menuOpen: false
};

/**
 * Initialize navigation system
 */
function initNavigation() {
  detectCurrentPage();
  initMobileMenu();
  initProgressTracking();
  highlightActiveNavigation();
  initKeyboardNavigation();
  initSmoothScroll();
}

/**
 * Detect current page/module
 */
function detectCurrentPage() {
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check if we're on a module page
  const moduleMatch = path.match(/modulo-(\d+)-([^\/]+)/);
  if (moduleMatch) {
    navState.currentModule = parseInt(moduleMatch[1]);
    navState.currentPage = 'module';
  } else if (path.endsWith('/index.html') || path === '/' || path.endsWith('/')) {
    navState.currentPage = 'home';
  }
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navState.menuOpen = !navState.menuOpen;
      mainNav?.classList.toggle('mobile-open', navState.menuOpen);
      menuToggle.setAttribute('aria-expanded', navState.menuOpen);
    });
  }
}

/**
 * Initialize progress tracking from localStorage
 */
function initProgressTracking() {
  const savedProgress = localStorage.getItem('courseProgress');
  if (savedProgress) {
    try {
      const progress = JSON.parse(savedProgress);
      courseData.modules.forEach((mod, index) => {
        if (progress[index] !== undefined) {
          mod.completed = progress[index];
        }
      });
    } catch (e) {
      console.warn('Failed to parse progress data');
    }
  }
  updateProgressUI();
}

/**
 * Update progress bar and indicators
 */
function updateProgressUI() {
  const completedCount = courseData.modules.filter(m => m.completed).length;
  const progressPercent = (completedCount / courseData.totalModules) * 100;
  
  // Update progress bars
  document.querySelectorAll('.progress-fill').forEach(bar => {
    bar.style.width = `${progressPercent}%`;
  });
  
  // Update progress text
  document.querySelectorAll('.progress-text').forEach(text => {
    text.textContent = `${completedCount} de ${courseData.totalModules} módulos completados`;
  });
  
  // Update module cards
  courseData.modules.forEach((mod, index) => {
    const moduleCards = document.querySelectorAll(`[data-module="${index + 1}"]`);
    moduleCards.forEach(card => {
      card.classList.toggle('completed', mod.completed);
      if (mod.completed) {
        card.setAttribute('data-completed', 'true');
      }
    });
  });
}

/**
 * Mark module as complete
 */
function markModuleComplete(moduleNum) {
  const moduleIndex = moduleNum - 1;
  if (moduleIndex >= 0 && moduleIndex < courseData.modules.length) {
    courseData.modules[moduleIndex].completed = true;
    saveProgress();
    updateProgressUI();
    showNotification('Módulo completado', 'success');
  }
}

/**
 * Save progress to localStorage
 */
function saveProgress() {
  const progress = courseData.modules.map(m => m.completed);
  localStorage.setItem('courseProgress', JSON.stringify(progress));
}

/**
 * Highlight active navigation items
 */
function highlightActiveNavigation() {
  // Highlight current module in sidebar
  document.querySelectorAll('.module-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && window.location.pathname.includes(href)) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
  
  // Highlight nav based on current page
  document.querySelectorAll('.main-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === 'index.html' && navState.currentPage === 'home') {
      link.classList.add('active');
    }
  });
}

/**
 * Initialize keyboard navigation
 */
function initKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Arrow key navigation between modules
    if (e.key === 'ArrowRight' && e.altKey) {
      navigateToNext();
    } else if (e.key === 'ArrowLeft' && e.altKey) {
      navigateToPrevious();
    }
  });
}

/**
 * Navigate to next module
 */
function navigateToNext() {
  if (navState.currentModule < courseData.totalModules) {
    const nextModule = courseData.modules[navState.currentModule];
    if (nextModule) {
      window.location.href = `modulos/${nextModule.slug}/index.html`;
    }
  }
}

/**
 * Navigate to previous module
 */
function navigateToPrevious() {
  if (navState.currentModule > 1) {
    const prevModule = courseData.modules[navState.currentModule - 2];
    if (prevModule) {
      window.location.href = `modulos/${prevModule.slug}/index.html`;
    }
  }
}

/**
 * Initialize smooth scroll
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * Quiz functionality
 */
const QuizManager = {
  currentQuestion: 0,
  score: 0,
  answers: {},
  
  init(quizId) {
    this.quizId = quizId;
    this.currentQuestion = 0;
    this.score = 0;
    this.answers = {};
    this.renderQuestion();
    this.attachListeners();
  },
  
  attachListeners() {
    const form = document.getElementById('quiz-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.checkAnswers();
      });
      
      // Track answers on selection
      form.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.answers[e.target.name] = e.target.value;
        });
      });
    }
  },
  
  checkAnswers() {
    const questions = document.querySelectorAll('.quiz-question');
    let correct = 0;
    
    questions.forEach((q, index) => {
      const correctAnswer = q.dataset.answer;
      const selected = this.answers[`question-${index}`];
      const options = q.querySelectorAll('.quiz-option');
      
      options.forEach(opt => {
        const radio = opt.querySelector('input');
        opt.classList.remove('correct', 'incorrect');
        
        if (radio.value === correctAnswer) {
          opt.classList.add('correct');
        } else if (radio.checked && radio.value !== correctAnswer) {
          opt.classList.add('incorrect');
        }
      });
      
      if (selected === correctAnswer) correct++;
    });
    
    this.score = correct;
    const passed = correct >= Math.ceil(questions.length * 0.6);
    
    if (passed) {
      markModuleComplete(this.getCurrentModuleNumber());
      showNotification(`¡Felicitaciones! Has aprobado con ${correct}/${questions.length}