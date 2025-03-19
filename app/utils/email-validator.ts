// utils/email-validator.ts
import fetch from 'node-fetch';
import dns from 'dns';
import { promisify } from 'util';

// List of common disposable email domains
const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'yopmail.com', 'sharklasers.com', 'trashmail.com', 'temp-mail.org',
  'fakemail.org', 'mailnull.com', // Add more as needed
];

// Check MX records to verify if the domain exists
const resolveMx = promisify(dns.resolveMx);

export async function isDisposableEmail(email: string): Promise<boolean> {
  try {
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return true; // Invalid format
    }

    // Extract domain from email
    const domain = email.split('@')[1].toLowerCase();

    // Check if domain is in our known disposable list
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return true;
    }

    // Optional: Use an external API to check for disposable emails
    // This is a hypothetical API - replace with an actual service if available
    try {
      const apiKey = process.env.EMAIL_VERIFICATION_API_KEY;
      if (apiKey) {
        const response = await fetch(`https://api.emailverification.com/v1/verify?email=${encodeURIComponent(email)}&key=${apiKey}`);
        const data = await response.json() as { disposable: boolean };
        if (data.disposable === true) {
          return true;
        }
      }
    } catch (apiError) {
      console.error('Email verification API error:', apiError);
      // Continue with other checks if API fails
    }

    // Check if domain has valid MX records (can receive email)
    try {
      const mxRecords = await resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return true; // No MX records, can't receive email
      }
    } catch {
      return true; // DNS error, domain likely invalid
    }

    // Email seems legitimate
    return false;
  } catch (error) {
    console.error('Email validation error:', error);
    return true; // When in doubt, treat as disposable for security
  }
}