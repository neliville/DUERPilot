// Main JavaScript for DUERPilot Landing Page

// Configuration Brevo - Utilise maintenant l'API route Next.js pour la sécurité
// La clé API ne doit JAMAIS être dans le code client
const BREVO_API_ENDPOINT = '/api/landing/waitlist';

// Header scroll effect
let lastScroll = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// FAQ Accordion
function toggleFaq(button) {
  const content = button.nextElementSibling;
  const isOpen = content.classList.contains('open');
  
  // Close all other FAQs
  document.querySelectorAll('.faq-content').forEach(item => {
    if (item !== content) {
      item.classList.remove('open');
      item.previousElementSibling.classList.remove('active');
    }
  });
  
  // Toggle current FAQ
  if (isOpen) {
    content.classList.remove('open');
    button.classList.remove('active');
  } else {
    content.classList.add('open');
    button.classList.add('active');
  }
}

// Waitlist Form Handler
async function handleWaitlistSubmit(form, formData) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  
  // Show loading state
  submitButton.classList.add('loading');
  submitButton.disabled = true;
  submitButton.textContent = 'Inscription en cours...';
  
  try {
    // Prepare data for Next.js API route (qui appelle Brevo côté serveur)
    const formDataObj = {
      email: formData.get('email'),
      prenom: formData.get('prenom') || '',
      entreprise: formData.get('entreprise') || '',
      secteur: formData.get('secteur') || '',
      consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
    };
    
    // Call Next.js API route (qui appelle Brevo côté serveur)
    const response = await fetch(BREVO_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formDataObj),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }
    
    // Success - Track event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'waitlist_signup', {
        'sector': formData.get('secteur'),
        'plan_interest': 'starter',
      });
    }
    
    // Show success message
    showSuccessMessage(form, 'Inscription réussie ! Vérifiez votre email.');
    
    // Redirect to confirmation page after 2 seconds
    setTimeout(() => {
      window.location.href = '/landing/confirmation.html';
    }, 2000);
    
  } catch (error) {
    console.error('Erreur inscription:', error);
    showErrorMessage(form, 'Erreur lors de l\'inscription. Veuillez réessayer.');
  } finally {
    // Reset button
    submitButton.classList.remove('loading');
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

// Show success message
function showSuccessMessage(form, message) {
  // Remove existing messages
  const existing = form.querySelector('.success-message, .error-message');
  if (existing) {
    existing.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message';
  messageDiv.textContent = message;
  form.appendChild(messageDiv);
  
  // Scroll to message
  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show error message
function showErrorMessage(form, message) {
  // Remove existing messages
  const existing = form.querySelector('.success-message, .error-message');
  if (existing) {
    existing.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'error-message';
  messageDiv.textContent = message;
  form.appendChild(messageDiv);
  
  // Scroll to message
  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize forms
document.addEventListener('DOMContentLoaded', () => {
  // Main waitlist form
  const waitlistForm = document.getElementById('waitlistForm');
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      await handleWaitlistSubmit(waitlistForm, formData);
    });
  }
  
  // Final CTA form
  const waitlistFormFinal = document.getElementById('waitlistFormFinal');
  if (waitlistFormFinal) {
    waitlistFormFinal.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      await handleWaitlistSubmit(waitlistFormFinal, formData);
    });
  }
  
  // Update counter (if API available)
  updateCounter();
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#!') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
});

// Update counter from Brevo API (or use static value)
async function updateCounter() {
  try {
    // Option 1: Créer une API route Next.js pour récupérer le compteur (recommandé pour la sécurité)
    // Exemple : const response = await fetch('/api/landing/counter');
    // const data = await response.json();
    // const count = data.count || 347;
    
    // Option 2: Static value (update manually)
    const count = 347;
    
    // Update all counters
    const counters = document.querySelectorAll('#counter, #counter-final');
    counters.forEach(counter => {
      if (counter) {
        counter.textContent = count.toLocaleString('fr-FR');
        counter.classList.add('counter-animate');
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour compteur:', error);
    // Fallback to static value
    const counters = document.querySelectorAll('#counter, #counter-final');
    counters.forEach(counter => {
      if (counter) {
        counter.textContent = '347';
      }
    });
  }
}

// Cookie banner management
function acceptCookies() {
  localStorage.setItem('cookies_accepted', 'true');
  localStorage.setItem('cookies_timestamp', new Date().toISOString());
  document.getElementById('cookie-banner').classList.add('hidden');
  
  // Enable analytics
  if (typeof gtag !== 'undefined') {
    gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
  }
}

function refuseCookies() {
  localStorage.setItem('cookies_accepted', 'false');
  localStorage.setItem('cookies_timestamp', new Date().toISOString());
  document.getElementById('cookie-banner').classList.add('hidden');
  
  // Disable analytics
  if (typeof gtag !== 'undefined') {
    gtag('consent', 'update', {
      'analytics_storage': 'denied'
    });
  }
}

// Check cookie consent on load
document.addEventListener('DOMContentLoaded', () => {
  const cookiesAccepted = localStorage.getItem('cookies_accepted');
  const cookieBanner = document.getElementById('cookie-banner');
  
  if (!cookiesAccepted && cookieBanner) {
    // Show banner after 1 second
    setTimeout(() => {
      cookieBanner.classList.remove('hidden');
    }, 1000);
  } else if (cookiesAccepted === 'true') {
    // Enable analytics if accepted
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  }
});

// Track scroll depth
let scrollTracked25 = false;
let scrollTracked50 = false;
let scrollTracked75 = false;
let scrollTracked100 = false;

window.addEventListener('scroll', () => {
  const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  
  if (scrollPercent > 25 && !scrollTracked25) {
    scrollTracked25 = true;
    if (typeof gtag !== 'undefined') {
      gtag('event', 'scroll', { 'percent': 25 });
    }
  }
  
  if (scrollPercent > 50 && !scrollTracked50) {
    scrollTracked50 = true;
    if (typeof gtag !== 'undefined') {
      gtag('event', 'scroll', { 'percent': 50 });
    }
  }
  
  if (scrollPercent > 75 && !scrollTracked75) {
    scrollTracked75 = true;
    if (typeof gtag !== 'undefined') {
      gtag('event', 'scroll', { 'percent': 75 });
    }
  }
  
  if (scrollPercent > 100 && !scrollTracked100) {
    scrollTracked100 = true;
    if (typeof gtag !== 'undefined') {
      gtag('event', 'scroll', { 'percent': 100 });
    }
  }
});

// Track CTA clicks
document.querySelectorAll('a[href="#waitlist"], a[href*="register"]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'cta_click', {
        'cta_location': link.closest('section')?.id || 'unknown',
        'cta_text': link.textContent.trim(),
      });
    }
  });
});

