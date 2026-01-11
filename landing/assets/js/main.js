// Main JavaScript for DUERPilot Landing Page

// Configuration Brevo (à remplacer par votre clé API publique)
const BREVO_API_KEY = 'YOUR_BREVO_API_KEY_PUBLIC';
const BREVO_LIST_ID = 123; // À remplacer par l'ID de votre liste Brevo

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

// FAQ Accordion avec accessibilité
function toggleFaq(button) {
  const content = button.nextElementSibling;
  const icon = button.querySelector('span[aria-hidden="true"]');
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  
  // Toggle current FAQ
  if (isExpanded) {
    content.classList.add('hidden');
    button.setAttribute('aria-expanded', 'false');
    if (icon) icon.textContent = '+';
  } else {
    // Close all other FAQs
    document.querySelectorAll('[aria-controls^="faq-"]').forEach(btn => {
      if (btn !== button) {
        const otherContent = document.getElementById(btn.getAttribute('aria-controls'));
        const otherIcon = btn.querySelector('span[aria-hidden="true"]');
        if (otherContent) otherContent.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        if (otherIcon) otherIcon.textContent = '+';
      }
    });
    
    content.classList.remove('hidden');
    button.setAttribute('aria-expanded', 'true');
    if (icon) icon.textContent = '−';
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
    // Prepare data for Brevo
    const brevoData = {
      email: formData.get('email'),
      attributes: {
        PRENOM: formData.get('prenom') || '',
        ENTREPRISE: formData.get('entreprise') || '',
        SECTEUR: formData.get('secteur') || '',
      },
      listIds: [BREVO_LIST_ID],
      updateEnabled: false,
      emailBlacklisted: false,
      smsBlacklisted: false,
    };
    
    // Call Brevo API
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brevoData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur ${response.status}`);
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
      window.location.href = '/confirmation.html';
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
    // Option 1: Fetch from Brevo API (requires API key)
    // const response = await fetch(`https://api.brevo.com/v3/contacts/lists/${BREVO_LIST_ID}`, {
    //   headers: { 'api-key': BREVO_API_KEY }
    // });
    // const data = await response.json();
    // const count = data.totalSubscribers || 347;
    
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

