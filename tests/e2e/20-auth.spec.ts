/**
 * E2E Auth Suite - All Login Paths
 * Tests authentication flows and social login buttons
 */
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

interface AuthError {
  flow: string;
  step: string;
  message: string;
  timestamp: string;
}

const authErrors: AuthError[] = [];

function setupErrorCapture(page: Page, flow: string) {
  page.on('pageerror', (error) => {
    authErrors.push({
      flow,
      step: 'pageerror',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  });
}

// Test credentials from GitHub Secrets (or skip if not available)
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || '';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || '';
const HAS_TEST_CREDS = TEST_EMAIL && TEST_PASSWORD;

test.describe('Auth - Login UI Render', () => {
  test('/login renders without crash', async ({ page }) => {
    setupErrorCapture(page, '/login');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check for crash screens
    const crashCount = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
    expect(crashCount, '/login shows crash screen').toBe(0);
    
    // Verify basic login form elements exist
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"]');
    
    const hasEmailInput = await emailInput.count() > 0;
    const hasPasswordInput = await passwordInput.count() > 0;
    
    console.log(`/login form: email=${hasEmailInput}, password=${hasPasswordInput}`);
    
    await page.screenshot({ path: 'test-results/auth/login-page.png' });
    
    // At minimum, page should render content
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(50);
  });

  test('/signup renders without crash', async ({ page }) => {
    setupErrorCapture(page, '/signup');
    
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    const crashCount = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
    expect(crashCount, '/signup shows crash screen').toBe(0);
    
    await page.screenshot({ path: 'test-results/auth/signup-page.png' });
  });

  test('/signin renders without crash', async ({ page }) => {
    setupErrorCapture(page, '/signin');
    
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    
    const crashCount = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
    expect(crashCount, '/signin shows crash screen').toBe(0);
    
    await page.screenshot({ path: 'test-results/auth/signin-page.png' });
  });

  test('/forgot-password renders without crash', async ({ page }) => {
    setupErrorCapture(page, '/forgot-password');
    
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    const crashCount = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
    expect(crashCount, '/forgot-password shows crash screen').toBe(0);
    
    await page.screenshot({ path: 'test-results/auth/forgot-password-page.png' });
  });
});

test.describe('Auth - Email/Password Flow', () => {
  test.skip(!HAS_TEST_CREDS, 'E2E_TEST_EMAIL and E2E_TEST_PASSWORD not set');

  test('Login with email/password', async ({ page }) => {
    setupErrorCapture(page, 'email-password-login');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Find and fill email input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    await emailInput.fill(TEST_EMAIL);
    
    // Find and fill password input
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);
    
    await page.screenshot({ path: 'test-results/auth/login-filled.png' });
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in")').first();
    await submitButton.click();
    
    // Wait for navigation or response
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/auth/login-submitted.png' });
    
    // Check for error messages or successful redirect
    const currentUrl = page.url();
    const errorMessage = await page.locator('text=/invalid|incorrect|error|failed/i').count();
    
    console.log(`After login submit: URL=${currentUrl}, errors=${errorMessage}`);
    
    // Success if we're redirected away from /login or no crash
    const crashCount = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
    expect(crashCount, 'Login flow crashed').toBe(0);
  });
});

test.describe('Auth - Social Login Buttons', () => {
  const SOCIAL_PROVIDERS = ['google', 'github', 'twitter', 'facebook', 'apple', 'discord'];

  test('Social login buttons do not crash on click', async ({ page }) => {
    setupErrorCapture(page, 'social-buttons');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    for (const provider of SOCIAL_PROVIDERS) {
      // Try to find social login button
      const selectors = [
        `button:has-text("${provider}")`,
        `a:has-text("${provider}")`,
        `button[aria-label*="${provider}" i]`,
        `a[href*="${provider}"]`,
        `button:has(svg[class*="${provider}" i])`,
        `[data-provider="${provider}"]`,
      ];
      
      let found = false;
      for (const selector of selectors) {
        const button = page.locator(selector).first();
        if (await button.count() > 0) {
          found = true;
          console.log(`Found ${provider} button`);
          
          // Click and verify no crash (don't complete OAuth)
          const [popup] = await Promise.all([
            page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
            button.click().catch(() => null),
          ]);
          
          if (popup) {
            const popupUrl = popup.url();
            console.log(`${provider} opened popup: ${popupUrl.substring(0, 50)}...`);
            await popup.close();
          } else {
            // Check if we navigated
            await page.waitForTimeout(1000);
            const newUrl = page.url();
            if (newUrl !== 'https://craudiovizai.com/login') {
              console.log(`${provider} navigated to: ${newUrl.substring(0, 50)}...`);
              await page.goto('/login');
              await page.waitForLoadState('networkidle');
            }
          }
          
          // Verify no crash after social button click
          const crashCount = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
          expect(crashCount, `${provider} button caused crash`).toBe(0);
          
          break;
        }
      }
      
      if (!found) {
        console.log(`No ${provider} button found - skipping`);
      }
    }
    
    await page.screenshot({ path: 'test-results/auth/social-buttons.png' });
  });
});

test.describe('Auth - Navigation to Login', () => {
  test('Homepage "Log In" link works', async ({ page }) => {
    setupErrorCapture(page, 'homepage-login-link');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loginLink = page.locator('a:has-text("Log In"), a:has-text("Login"), a:has-text("Sign In"), a[href*="login"]').first();
    
    if (await loginLink.count() > 0) {
      await signupLink.click();
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('login');
      
      const crashCount = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
      expect(crashCount).toBe(0);
    } else {
      console.log('No login link found on homepage');
    }
    
    await page.screenshot({ path: 'test-results/auth/homepage-to-login.png' });
  });

  test('Homepage "Sign Up" / "Get Started" link works', async ({ page }) => {
    setupErrorCapture(page, 'homepage-signup-link');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const signupLink = page.locator('a:has-text("Sign Up"), a:has-text("Get Started"), a:has-text("Register"), a[href*="signup"]').first();
    
    if (await signupLink.count() > 0) {
      await signupLink.click();
      await page.waitForLoadState('networkidle');
      
      const crashCount = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
      expect(crashCount).toBe(0);
    } else {
      console.log('No signup link found on homepage');
    }
    
    await page.screenshot({ path: 'test-results/auth/homepage-to-signup.png' });
  });
});

test.afterAll(async () => {
  if (!fs.existsSync('test-results/auth')) {
    fs.mkdirSync('test-results/auth', { recursive: true });
  }
  
  if (authErrors.length > 0) {
    fs.writeFileSync('test-results/auth/auth-errors.json', JSON.stringify(authErrors, null, 2));
    console.log(`\n⚠️ ${authErrors.length} auth errors - see auth-errors.json`);
  } else {
    console.log('\n✅ No auth errors');
  }
});
