/**
 * Authentication and Security Helper
 * Uses Web Crypto SHA-256 with salt to ensure passwords are never stored in plain text.
 */

const SALT = '_schoolrout_phnom_penh_salt_2026_';

export async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  const computed = await hashPassword(plainText);
  return computed === hash;
}

export function validateEmailOrPhone(input: string): { valid: boolean; isEmail: boolean; error?: string } {
  const trimmed = input.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[(]?[0-9]{2,4}[)]?[-\s.]?[0-9]{3,4}[-\s.]?[0-9]{3,6}$/;

  if (emailRegex.test(trimmed)) {
    return { valid: true, isEmail: true };
  }
  if (phoneRegex.test(trimmed.replace(/\s+/g, ''))) {
    return { valid: true, isEmail: false };
  }
  return { 
    valid: false, 
    isEmail: false, 
    error: 'Please enter a valid email address or phone number (e.g. +855 12 345 678 or user@school.edu.kh)' 
  };
}

export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { valid: true };
}
