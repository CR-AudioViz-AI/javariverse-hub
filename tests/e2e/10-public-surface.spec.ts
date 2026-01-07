/**
 * E2E Public Surface Tests
 * Tests all routes render without crashes and internal links work
 */
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

// Console error allowlist - exact matches with justification
const ALLOWLISTED_ERRORS: { pattern: RegExp; reason: string }[] = [
  { pattern: /cloudflareinsights/, reason: 'Third-party analytics, non-critical' },
  { pattern: /Failed to load resource.*favicon/, reason: 'Favicon 404 is cosmetic' },
  { pattern: /ResizeObserver loop/, reason: 'Browser quirk, not a real error' },
];

// Routes to test (200 OK expected)
const WORKING_ROUTES = [
  '/',
  '/about',
  '/careers',
  '/cookies',
  '/craiverse',
  '/games',
  '/javari',
  '/login',
  '/newsletter',
  '/press',
  '/pricing',
  '/signup',
  '/support',
  '/tools',
  '/forgot-password',
];

// Routes that return 503 (under construction) - test they don't crash
const UNDER_CONSTRUCTION_ROUTES = [
  '/accessibility',
  '/apps',
  '/blog',
  '/community',
  '/contact',
  '/dmca',
  '/javariverse',
  '/privacy',
  '/terms',
];

// Crash indicators
const CRASH_INDICATORS = [
  'Application error',
  'Unhandled Runtime Error',
  'client-side exception',
  'Internal Server Error',
  'Error: ',
];

interface TestError {
  route: string;
  type: 'pageerror' | 'console' | 'crash_screen';
  message: string;
  allowlisted: boolean;
}

const collectedErrors: TestError[] = [];

function isAllowlisted(message: string): boolean {
  return ALLOWLISTED_ERRORS.some(({ pattern }) => pattern.test(message));
}

function setupErrorListeners(page: Page, route: string) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const allowed = isAllowlisted(text);
      collectedErrors.push({
        route,
        type: 'console',
        message: text,
        allowlisted: allowed,
      });
      if (!allowed) {
        console.log(`[${route}] Console error: ${text.substring(0, 100)}`);
      }
    }
  });

  page.on('pageerror', (error) => {
    collectedErrors.push({
      route,
      type: 'pageerror',
      message: error.message,
      allowlisted: false,
    });
    console.error(`[${route}] PAGE ERROR: ${error.message}`);
  });
}

async function checkForCrashScreen(page: Page, route: string): Promise<boolean> {
  const bodyText = await page.locator('body').textContent() || '';
  for (const indicator of CRASH_INDICATORS) {
    if (bodyText.includes(indicator)) {
      collectedErrors.push({
        route,
        type: 'crash_screen',
        message: `Found crash indicator: "${indicator}"`,
        allowlisted: false,
      });
      return true;
    }
  }
  return false;
}

test.describe('Public Surface - Working Routes', () => {
  for (const route of WORKING_ROUTES) {
    test(`Route ${route} renders without crash`, async ({ page }) => {
      setupErrorListeners(page, route);
      
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(500);
      
      await page.waitForLoadState('domcontentloaded');
      
      const hasCrash = await checkForCrashScreen(page, route);
      expect(hasCrash, `${route} should not show crash screen`).toBe(false);
      
      // Check for pageerrors (critical)
      const pageErrors = collectedErrors.filter(
        e => e.route === route && e.type === 'pageerror'
      );
      expect(pageErrors.length, `${route} should have no JS exceptions`).toBe(0);
      
      await page.screenshot({ path: `test-results/route-${route.replace(/\//g, '_') || 'home'}.png` });
    });
  }
});

test.describe('Public Surface - Under Construction Routes', () => {
  for (const route of UNDER_CONSTRUCTION_ROUTES) {
    test(`Route ${route} handles gracefully`, async ({ page }) => {
      setupErrorListeners(page, route);
      
      const response = await page.goto(route);
      // 503 is expected for under construction
      expect([200, 503]).toContain(response?.status());
      
      await page.waitForLoadState('domcontentloaded');
      
      // Even 503 pages shouldn't have JS crashes
      const pageErrors = collectedErrors.filter(
        e => e.route === route && e.type === 'pageerror'
      );
      expect(pageErrors.length, `${route} should have no JS exceptions`).toBe(0);
    });
  }
});

test.describe('Public Surface - Internal Link Navigation', () => {
  test('All footer links navigate without crash', async ({ page }) => {
    setupErrorListeners(page, 'footer-links');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const footerLinks = await page.locator('footer a[href^="/"]').all();
    const hrefs: string[] = [];
    
    for (const link of footerLinks) {
      const href = await link.getAttribute('href');
      if (href && !hrefs.includes(href) && !href.includes('/_next')) {
        hrefs.push(href);
      }
    }
    
    console.log(`Testing ${hrefs.length} footer links`);
    
    for (const href of hrefs.slice(0, 10)) {
      await page.goto(href);
      await page.waitForLoadState('domcontentloaded');
      
      const pageErrors = collectedErrors.filter(
        e => e.route === href && e.type === 'pageerror'
      );
      expect(pageErrors.length, `${href} should have no JS exceptions`).toBe(0);
    }
  });

  test('Navigation menu links work', async ({ page }) => {
    setupErrorListeners(page, 'nav-links');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const navLinks = await page.locator('nav a[href^="/"], header a[href^="/"]').all();
    const hrefs: string[] = [];
    
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && !hrefs.includes(href) && href !== '/') {
        hrefs.push(href);
      }
    }
    
    console.log(`Testing ${hrefs.length} nav links`);
    
    for (const href of hrefs.slice(0, 5)) {
      await page.goto(href);
      await page.waitForLoadState('domcontentloaded');
      
      const hasCrash = await checkForCrashScreen(page, href);
      expect(hasCrash, `${href} should not show crash screen`).toBe(false);
    }
  });
});

test.describe('Public Surface - CTA Buttons', () => {
  test('Homepage CTAs navigate correctly', async ({ page }) => {
    setupErrorListeners(page, 'cta-buttons');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test "Get Started" if present
    const getStarted = page.locator('a:has-text("Get Started"), button:has-text("Get Started")').first();
    if (await getStarted.count() > 0) {
      await getStarted.click();
      await page.waitForLoadState('domcontentloaded');
      
      const hasCrash = await checkForCrashScreen(page, 'cta-get-started');
      expect(hasCrash).toBe(false);
    }
    
    // Return home and test "Learn More" if present
    await page.goto('/');
    const learnMore = page.locator('a:has-text("Learn More"), button:has-text("Learn More")').first();
    if (await learnMore.count() > 0) {
      await learnMore.click();
      await page.waitForLoadState('domcontentloaded');
      
      const hasCrash = await checkForCrashScreen(page, 'cta-learn-more');
      expect(hasCrash).toBe(false);
    }
  });

  test('Pricing page CTAs work', async ({ page }) => {
    setupErrorListeners(page, 'pricing-cta');
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Find pricing plan buttons
    const planButtons = await page.locator('a[href*="signup"], a[href*="contact"], button:has-text("Start"), button:has-text("Subscribe")').all();
    
    console.log(`Found ${planButtons.length} pricing CTAs`);
    
    if (planButtons.length > 0) {
      // Test first plan button
      const href = await planButtons[0].getAttribute('href');
      if (href) {
        await page.goto(href);
        await page.waitForLoadState('domcontentloaded');
        
        const pageErrors = collectedErrors.filter(
          e => e.type === 'pageerror' && !e.allowlisted
        );
        expect(pageErrors.length).toBe(0);
      }
    }
  });
});

test.afterAll(async () => {
  // Write error report
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  
  const nonAllowlisted = collectedErrors.filter(e => !e.allowlisted);
  const report = {
    totalErrors: collectedErrors.length,
    nonAllowlistedErrors: nonAllowlisted.length,
    allowlistedErrors: collectedErrors.length - nonAllowlisted.length,
    errors: nonAllowlisted,
    allowlist: ALLOWLISTED_ERRORS.map(e => ({ pattern: e.pattern.toString(), reason: e.reason })),
  };
  
  fs.writeFileSync('test-results/public-surface-errors.json', JSON.stringify(report, null, 2));
  
  console.log(`\nError Summary:`);
  console.log(`  Total: ${collectedErrors.length}`);
  console.log(`  Non-allowlisted: ${nonAllowlisted.length}`);
  console.log(`  Allowlisted: ${collectedErrors.length - nonAllowlisted.length}`);
});
