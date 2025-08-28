// Professional Loading Screen
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressBar = document.getElementById('progress-bar');
        this.percentageElement = document.getElementById('loading-percentage');
        this.statusElement = document.getElementById('loading-status');
        this.websiteContent = document.querySelector('.main-website-content');
        
        this.currentProgress = 0;
        this.targetProgress = 0;
        this.isComplete = false;
        this.minDisplayTime = 3000; // Minimum 3 seconds for branding
        this.startTime = Date.now();
        
        this.loadingSteps = [
            { progress: 15, status: 'Carregando recursos...', delay: 200 },
            { progress: 35, status: 'Inicializando interface...', delay: 300 },
            { progress: 55, status: 'Processando conteúdo...', delay: 400 },
            { progress: 75, status: 'Otimizando desempenho...', delay: 350 },
            { progress: 90, status: 'Finalizando carregamento...', delay: 250 },
            { progress: 100, status: 'Carregamento concluído!', delay: 200 }
        ];
        
        this.init();
    }
    
    init() {
        if (!this.loadingScreen) return;
        
        // Add loading class to body for better browser compatibility
        document.body.classList.add('loading-active');
        
        // Prevent scrolling during loading
        document.body.style.overflow = 'hidden';
        
        // Start the loading sequence
        this.startLoadingSequence();
        
        // Track actual page loading
        this.trackPageLoad();
        
        // GPU acceleration for smoother animations
        this.loadingScreen.style.transform = 'translateZ(0)';
        this.loadingScreen.style.backfaceVisibility = 'hidden';
        this.loadingScreen.style.willChange = 'opacity, visibility';
    }
    
    startLoadingSequence() {
        let stepIndex = 0;
        
        const executeStep = () => {
            if (stepIndex < this.loadingSteps.length) {
                const step = this.loadingSteps[stepIndex];
                
                // Update status
                this.updateStatus(step.status);
                
                // Animate progress
                this.animateProgress(step.progress);
                
                stepIndex++;
                setTimeout(executeStep, step.delay);
            } else {
                this.checkCompletionConditions();
            }
        };
        
        // Start with a small delay for better UX
        setTimeout(executeStep, 500);
    }
    
    updateStatus(status) {
        if (this.statusElement) {
            this.statusElement.style.opacity = '0';
            setTimeout(() => {
                this.statusElement.textContent = status;
                this.statusElement.style.opacity = '0.8';
            }, 150);
        }
    }
    
    animateProgress(targetProgress) {
        this.targetProgress = targetProgress;
        
        const animate = () => {
            const diff = this.targetProgress - this.currentProgress;
            
            if (Math.abs(diff) < 0.5) {
                this.currentProgress = this.targetProgress;
                this.updateUI();
                return;
            }
            
            this.currentProgress += diff * 0.1;
            this.updateUI();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    updateUI() {
        if (this.progressBar) {
            this.progressBar.style.width = `${this.currentProgress}%`;
        }
        
        if (this.percentageElement) {
            this.percentageElement.textContent = Math.round(this.currentProgress);
        }
    }
    
    trackPageLoad() {
        // Track DOM content loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.checkCompletionConditions();
            });
        }
        
        // Track window load (all resources)
        window.addEventListener('load', () => {
            this.isComplete = true;
            this.checkCompletionConditions();
        });
        
        // Fallback timeout
        setTimeout(() => {
            this.isComplete = true;
            this.checkCompletionConditions();
        }, 8000);
    }
    
    checkCompletionConditions() {
        const elapsedTime = Date.now() - this.startTime;
        const isMinTimeReached = elapsedTime >= this.minDisplayTime;
        const isProgressComplete = this.currentProgress >= 100;
        
        if (this.isComplete && isMinTimeReached && isProgressComplete) {
            this.completeLoading();
        } else {
            // Check again after a short delay
            setTimeout(() => this.checkCompletionConditions(), 100);
        }
    }
    
    completeLoading() {
        // Final status update
        this.updateStatus('Bem-vindo à Latanegeo!');
        
        // Ensure progress is at 100%
        this.animateProgress(100);
        
        // Fade out after a brief delay
        setTimeout(() => {
            this.fadeOut();
        }, 800);
    }
    
    fadeOut() {
        if (this.loadingScreen) {
            // Start coordinated fade transition
            this.startCoordinatedFade();
        }
    }
    
    startCoordinatedFade() {
        // Trigger BOTH animations at exactly the same time for perfect crossfade
        // Loading screen: opacity 1 → 0 over 1.5s ease-in-out
        // Website content: opacity 0 → 1 over 1.5s ease-in-out
        // Result: Seamless transition with no delays or gaps
        
        console.log('Starting coordinated fade transition...');
        
        // CRITICAL: Remove loading-active class FIRST to clear conflicting CSS rules
        console.log('Removing loading-active class to clear CSS conflicts');
        document.body.classList.remove('loading-active');
        document.body.style.overflow = '';
        
        // Small delay to ensure CSS rules are cleared before starting transitions
        requestAnimationFrame(() => {
            if (this.loadingScreen) {
                console.log('Adding fade-out to loading screen');
                this.loadingScreen.classList.add('fade-out');
            }
            
            if (this.websiteContent) {
                console.log('Adding fade-in to website content');
                console.log('Before - Opacity:', getComputedStyle(this.websiteContent).opacity);
                console.log('Before - Visibility:', getComputedStyle(this.websiteContent).visibility);
                console.log('Before - Transition:', getComputedStyle(this.websiteContent).transition);
                
                this.websiteContent.classList.add('fade-in');
                console.log('Website content classes:', this.websiteContent.className);
                
                // Check computed styles after class addition
                setTimeout(() => {
                    console.log('After - Opacity:', getComputedStyle(this.websiteContent).opacity);
                    console.log('After - Visibility:', getComputedStyle(this.websiteContent).visibility);
                }, 50);
            } else {
                console.error('Website content element not found!');
            }
        });
        
        // Clean up loading screen after fade-out completes (1.5s transition + small buffer)
        setTimeout(() => {
            if (this.loadingScreen && this.loadingScreen.parentNode) {
                this.loadingScreen.parentNode.removeChild(this.loadingScreen);
            }
            
            // Clean up willChange properties for performance
            if (this.websiteContent) {
                this.websiteContent.style.willChange = 'auto';
            }
            
            this.loadingScreen = null;
        }, 1600);
    }
}

// Initialize loading screen immediately
const loadingScreen = new LoadingScreen();

// Enhanced Website Functionality
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Performance optimization
    let ticking = false;
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('fade-in')) {
                    entry.target.classList.add('visible');
                }
                if (entry.target.classList.contains('slide-up')) {
                    entry.target.classList.add('visible');
                }
            }
        });
    }, observerOptions);
    
    // Add animation classes and observe elements
    function initAnimations() {
        const animatedElements = document.querySelectorAll('.service-card, .project-card, .mvv-card, .feature, .expertise-item, .knowledge-item, .contact-item');
        animatedElements.forEach((element, index) => {
            element.classList.add('fade-in');
            element.style.transitionDelay = `${index * 100}ms`;
            observer.observe(element);
        });
    }

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Active navigation link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);

    // Enhanced navigation link handling
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // Close mobile menu if open
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            
            if (href.startsWith('#')) {
                smoothScroll(href);
            }
        });
    });

    // Enhanced header scroll behavior
    function updateHeaderBackground() {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Throttled scroll event
    window.addEventListener('scroll', updateHeaderBackground, { passive: true });
    
    // Smooth scroll for navigation links with offset
    function smoothScroll(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = header.offsetHeight;
            const elementPosition = element.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    // Contact form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            // Simple form validation
            if (!name || !email || !subject || !message) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, insira um email válido.');
                return;
            }

            // Success message (in a real application, you would send this to a server)
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            this.reset();
        });
    }

    // Animate elements on scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.feature, .project-card, .knowledge-item');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    // Initialize animation styles
    function initAnimations() {
        const elements = document.querySelectorAll('.feature, .project-card, .knowledge-item');
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
    }

    // Initialize animations and run on scroll
    initAnimations();
    window.addEventListener('scroll', animateOnScroll);
    
    // Enhanced form validation and UX
    function validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            const errorElement = field.parentNode.querySelector('.error-message');
            
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                if (!errorElement) {
                    const error = document.createElement('span');
                    error.className = 'error-message';
                    error.textContent = 'Este campo é obrigatório';
                    field.parentNode.appendChild(error);
                }
            } else {
                field.classList.remove('error');
                if (errorElement) {
                    errorElement.remove();
                }
            }
        });
        
        return isValid;
    }
    
    // Add loading state to buttons
    function setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<span>Enviando...</span>';
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.innerHTML = '<span>Enviar Mensagem</span>';
            button.classList.remove('loading');
        }
    }
    
    // Initialize animations and enhanced behaviors
    initAnimations();
    
    // Add error message styles
    const style = document.createElement('style');
    style.textContent = `
        .form-group .error-message {
            color: var(--error-500);
            font-size: var(--font-size-xs);
            margin-top: var(--space-1);
            display: block;
        }
        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
            border-color: var(--error-500);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        .btn.loading {
            opacity: 0.7;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
    
    // Lazy loading for images (if any are added later)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});