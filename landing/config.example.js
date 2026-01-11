/**
 * Configuration Example for DUERPilot Landing Page
 * 
 * Copy this file to config.js and fill in your actual values
 * DO NOT commit config.js to version control
 */

// Brevo Configuration
export const BREVO_CONFIG = {
  API_KEY: 'YOUR_BREVO_API_KEY_PUBLIC', // Clé API publique Brevo (restreinte)
  LIST_ID: 123, // ID de la liste "Waitlist DUERPilot"
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX', // Google Analytics 4 Measurement ID
  CLARITY_ID: 'YOUR_CLARITY_ID', // Microsoft Clarity Project ID
};

// Application URLs
export const APP_URLS = {
  REGISTER: 'https://app.duerpilot.fr/register',
  PRICING: 'https://app.duerpilot.fr/pricing',
  DASHBOARD: 'https://app.duerpilot.fr/dashboard',
};

// Contact Information
export const CONTACT = {
  EMAIL: 'contact@duerpilot.fr',
  SUPPORT_EMAIL: 'support@duerpilot.fr',
  DPO_EMAIL: 'dpo@duerpilot.fr',
};

// Launch Information
export const LAUNCH = {
  DATE: 'Mai 2025',
  DATE_ISO: '2025-05-01',
  EARLY_ADOPTER_DISCOUNT: 30, // Pourcentage
  EARLY_ADOPTER_ONBOARDING_VALUE: 200, // En euros
};

