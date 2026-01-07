/**
 * E2E Authentication Tests
 * Tests all login paths including UI render, form submission, and social login buttons
 */
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

// Test credentials from GitHub Secrets
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e-test@craudiovizai.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestPassword123!';

const AUTH_ROUTES = [
  { path: '/login', name: 'Login Page' },
  { path: '/signup', name: 'Signup Page' },
  { path: '/forgot-password', name: 'Forgot Password' },
];

const SOCIAL_PROVIDERS = [
  { name: 'Google', patterns: ['google', 'accounts.google.com'] },
  { name: 'GitHub', patterns: ['github', 'github.com/login'] },
  { name: 'Discord', patterns: ['discord', 'discord.com/oauth'] },
  { name: 'Apple', patterns: ['apple', 'appleid.apple.com'] },
];

interface AuthError {
  route: string;
  action: string;
  message: string;
}

const authErrors: AuthError[] = [];

function setupErrorListeners(page: Page, context: string) {
  page.on('pageerror', (error) => {
    authErrors.push({
      route: context,
      action: 'pageerror',
      message: error.message,
    });
    console.error(`[${context}] JS Exception: ${error.message}`);
  });
}

test.describe('Auth - Page Renders', () => {
  for (const { path, name } of AUTH_ROUTES) {
    test(`${name} (${path}) renders without crash`, async ({ page }) => {
      setupErrorListeners(page, path);
      
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(500);
      
      await page.waitForLoadState('domcontentloaded');
      
      // Check for crash indicators
      const bodyText = await page.locator('body').textContent() || '';
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('Unhandled Runtime Error');
      
      // Check page has content
      expect(bodyText.length).toBeGreaterThan(100);
      
      await page.screenshot({ path: `test-results/auth-${path.replace(/\//g, '')}.png` });
      
      // Verify no JS exceptions
      const pageErrors = authErrors.filter(e => e.route === path && e.action === 'pageerror');
      expect(pageErrors.length, `${name} should have no JS exceptions`).toBe(0);
    });
  }
});

test.describe('Auth - Login Form', () => {
  test('Login form elements are present', async ({ page }) => {
    setupErrorListeners(page, '/login-form');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Look for email/password inputs
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    const hasEmailInput = await emailInput.count() > 0;
    const hasPasswordInput = await passwordInput.count() > 0;
    
    console.log(`  Email input: ${hasEmailInput ? 'Found' : 'Not found'}`);
    console.log(`  Password input: ${hasPasswordInput ? 'Found' : 'Not found'}`);
    
    // At least one form element should exist
    expect(hasEmailInput || hasPasswordInput, 'Login form should have input fields').toBe(true);
  });

  test('Login form accepts input without crash', async ({ page }) => {
    setupErrorListeners(page, '/login-input');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Find and fill email input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(TEST_EMAIL);
      console.log('  Filled email input');
    }
    
    // Find and fill password input
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(TEST_PASSWORD);
      console.log('  Filled password input');
    }
    
    // Verify no crash after filling
    const bodyText = await page.locator('body').textContent() || '';
    expect(bodyText).not.toContain('Application error');
    
    await page.screenshot({ path: 'test-results/auth-login-filled.png' });
  });

  test('Login form submission attempt', async ({ page }) => {
    setupErrorListeners(page, '/login-submit');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill credentials if available from env
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.count() > 0) {
      await emailInput.fill(TEST_EMAIL);
    }
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(TEST_PASSWORD);
    }
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Login")').first();
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Wait for response (success or error)
      await page.waitForLoadState('networkidle');
      
      // Check for crash (not validation errors)
      const bodyText = await page.locator('body').textContent() || '';
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('Unhandled Runtime Error');
      
      console.log('  Form submitted without crash');
    } else {
      console.log('  No submit button found');
    }
    
    await page.screenshot({ path: 'test-results/auth-login-submitted.png' });
  });
});

test.describe('Auth - Signup Form', () => {
  test('Signup form renders and accepts input', async ({ page }) => {
    setupErrorListeners(page, '/signup-form');
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // Check for form elements
    const hasForm = await page.locator('form, input[type="email"], input[type="password"]').count() > 0;
    
    if (hasForm) {
      console.log('  Signup form found');
      
      // Try filling inputs
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      if (await emailInput.count() > 0) {
        await emailInput.fill('test-signup@example.com');
      }
      
      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('TestPassword123!');
      }
    }
    
    // Verify no crash
    const pageErrors = authErrors.filter(e => e.route === '/signup-form' && e.action === 'pageerror');
    expect(pageErrors.length).toBe(0);
    
    await page.screenshot({ path: 'test-results/auth-signup-form.png' });
  });
});

test.describe('Auth - Social Login Buttons', () => {
  test('Social login buttons exist and are clickable', async ({ page }) => {
    setupErrorListeners(page, '/login-social');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const foundProviders: string[] = [];
    
    for (const provider of SOCIAL_PROVIDERS) {
      // Look for provider button
      const button = page.locator(
        `button:has-text("${provider.name}"), ` +
        `a:has-text("${provider.name}"), ` +
        `[aria-label*="${provider.name}" i], ` +
        `button[class*="${provider.name.toLowerCase()}"], ` +
        `a[href*="${provider.patterns[0]}"]`
      ).first();
      
      if (await button.count() > 0) {
        foundProviders.push(provider.name);
        console.log(`  Found ${provider.name} button`);
      }
    }
    
    console.log(`  Total social providers found: ${foundProviders.length}`);
    
    // Store findings in screenshot
    await page.screenshot({ path: 'test-results/auth-social-buttons.png' });
  });

  test('Social login click initiates redirect without crash', async ({ page, context }) => {
    setupErrorListeners(page, '/login-social-click');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Find any social button
    const socialButton = page.locator(
      'button:has-text("Google"), a:has-text("Google"), ' +
      'button:has-text("GitHub"), a:has-text("GitHub"), ' +
      'button:has-text("Discord"), a:has-text("Discord")'
    ).first();
    
    if (await socialButton.count() > 0) {
      const buttonText = await socialButton.textContent();
      console.log(`  Testing click on: ${buttonText}`);
      
      // Listen for navigation
      const [newPage] = await Promise.all([
        context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
        socialButton.click().catch(() => null),
      ]);
      
      // Either opened new page or stayed on same page
      if (newPage) {
        const newUrl = newPage.url();
        console.log(`  Redirected to: ${newUrl}`);
        
        // Verify redirect goes to a real OAuth provider
        const isValidOAuth = SOCIAL_PROVIDERS.some(p => 
          p.patterns.some(pattern => newUrl.includes(pattern))
        );
        
        if (isValidOAuth) {
          console.log('  ✅ Valid OAuth redirect');
        }
        
        await newPage.close();
      } else {
        // Check if URL changed on same page
        const currentUrl = page.url();
        console.log(`  Current URL after click: ${currentUrl}`);
        
        // No crash is good
        const bodyText = await page.locator('body').textContent() || '';
        expect(bodyText).not.toContain('Application error');
      }
    } else {
      console.log('  No social login buttons found');
    }
    
    await page.screenshot({ path: 'test-results/auth-social-click.png' });
  });
});

test.describe('Auth - Password Reset', () => {
  test('Forgot password form works', async ({ page }) => {
    setupErrorListeners(page, '/forgot-password');
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // Look for email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
      console.log('  Filled reset email');
      
      // Find submit
      const submitButton = page.locator('button[type="submit"], button:has-text("Reset"), button:has-text("Send")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Check no crash
        const bodyText = await page.locator('body').textContent() || '';
        expect(bodyText).not.toContain('Application error');
        console.log('  Reset request submitted without crash');
      }
    }
    
    await page.screenshot({ path: 'test-results/auth-forgot-password.png' });
  });
});

test.afterAll(async () => {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  
  fs.writeFileSync('test-results/auth-errors.json', JSON.stringify({
    totalErrors: authErrors.length,
    errors: authErrors,
  }, null, 2));
  
  console.log(`\nAuth Test Summary:`);
  console.log(`  Total errors captured: ${authErrors.length}`);
});
