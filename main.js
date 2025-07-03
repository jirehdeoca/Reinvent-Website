// Reinvent International Website JavaScript

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect to header
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = '#ffffff';
            header.style.backdropFilter = 'none';
        }
    });

    // Animate cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe all cards and testimonials
    const animatedElements = document.querySelectorAll('.card, .testimonial');
    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Mobile menu toggle (for future implementation)
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Form validation (for future contact forms)
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                } else {
                    field.style.borderColor = '#d1d5db';
                }
            });
            
            if (isValid) {
                // Here you would typically send the form data
                alert('Thank you for your interest! We will contact you soon.');
                form.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });
    });

    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .cta-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Newsletter signup functionality
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]').value;
            
            if (email && isValidEmail(email)) {
                alert('Thank you for subscribing to our biblical leadership insights!');
                form.reset();
            } else {
                alert('Please enter a valid email address.');
            }
        });
    });

    // Email validation helper function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Add loading states for buttons
    function addLoadingState(button, text = 'Loading...') {
        const originalText = button.textContent;
        button.textContent = text;
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
    }

    // Add click tracking for analytics (placeholder)
    document.addEventListener('click', function(e) {
        if (e.target.matches('.btn-primary, .btn-secondary, .cta-button')) {
            // Here you would typically send analytics data
            console.log('Button clicked:', e.target.textContent);
        }
    });
});

// Utility functions
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Add scroll-to-top functionality
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    
    if (scrollButton) {
        if (window.scrollY > 500) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    }
});

