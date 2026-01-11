// Google Analytics 4 and Microsoft Clarity Integration

// Google Analytics 4
(function() {
  // Replace with your GA4 Measurement ID
  const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  
  // Check cookie consent before loading GA4
  const cookiesAccepted = localStorage.getItem('cookies_accepted');
  
  if (cookiesAccepted === 'true' || cookiesAccepted === null) {
    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    // Initialize GA4
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    
    // Configure consent mode
    gtag('consent', 'default', {
      'analytics_storage': cookiesAccepted === 'true' ? 'granted' : 'denied',
      'ad_storage': 'denied',
      'wait_for_update': 500,
    });
    
    gtag('config', GA4_MEASUREMENT_ID, {
      'page_path': window.location.pathname,
      'page_title': document.title,
    });
    
    // Make gtag available globally
    window.gtag = gtag;
  }
})();

// Microsoft Clarity
(function() {
  // Configuration via window object ou variable globale
  // Pour Next.js, peut être configuré via NEXT_PUBLIC_CLARITY_ID dans .env.local
  const CLARITY_ID = window.CLARITY_ID || process?.env?.NEXT_PUBLIC_CLARITY_ID || 'YOUR_CLARITY_ID';
  
  // Si pas configuré, ne pas charger Clarity
  if (!CLARITY_ID || CLARITY_ID === 'YOUR_CLARITY_ID') {
    console.log('Microsoft Clarity non configuré - saut de l\'initialisation');
    return;
  }
  
  // Check cookie consent
  const cookiesAccepted = localStorage.getItem('cookies_accepted');
  
  if (cookiesAccepted === 'true' || cookiesAccepted === null) {
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }
})();

// Track page views
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      'page_path': window.location.pathname,
      'page_title': document.title,
    });
  }
});

// Track external link clicks
document.querySelectorAll('a[href^="http"]').forEach(link => {
  if (link.hostname !== window.location.hostname) {
    link.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
          'event_category': 'outbound',
          'event_label': link.href,
          'transport_type': 'beacon',
        });
      }
    });
  }
});

// Track FAQ opens
document.querySelectorAll('[onclick*="toggleFaq"]').forEach(button => {
  button.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      const question = button.textContent.trim();
      gtag('event', 'faq_open', {
        'question': question,
      });
    }
  });
});

// Track pricing card hovers
document.querySelectorAll('#pricing .border').forEach(card => {
  card.addEventListener('mouseenter', () => {
    if (typeof gtag !== 'undefined') {
      const planName = card.querySelector('h3')?.textContent || 'unknown';
      gtag('event', 'pricing_hover', {
        'plan': planName,
      });
    }
  });
});

