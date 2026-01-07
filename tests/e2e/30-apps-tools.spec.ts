/**
 * E2E Apps & Tools Suite
 * Tests every app/tool entry point and primary CTAs
 */
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

interface AppTestResult {
  path: string;
  name: string;
  status: number;
  hasCTA: boolean;
  ctaWorked: boolean;
  errors: string[];
  timestamp: string;
}

const appResults: AppTestResult[] = [];
const collectedErrors: { app: string; error: string }[] = [];

function setupErrorCapture(page: Page, appPath: string) {
  page.on('pageerror', (error) => {
    collectedErrors.push({ app: appPath, error: `pageerror: ${error.message}` });
  });
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter out known non-critical errors
      if (!text.includes('Failed to load resource') && !text.includes('Content Security Policy')) {
        collectedErrors.push({ app: appPath, error: `console: ${text}` });
      }
    }
  });
}

// All known app routes
const APP_ROUTES = [
  { path: '/apps/javari-ai', name: 'Javari AI' },
  { path: '/apps/logo-studio', name: 'Logo Studio' },
  { path: '/apps/meme-generator', name: 'Meme Generator' },
  { path: '/apps/games-hub', name: 'Games Hub' },
  { path: '/apps/orlando-trip-deal', name: 'Orlando Trip Deal' },
  { path: '/apps/watch-works', name: 'Watch Works' },
];

// CTA button patterns to look for
const CTA_PATTERNS = [
  'button:has-text("Start")',
  'button:has-text("Try")',
  'button:has-text("Create")',
  'button:has-text("Generate")',
  'button:has-text("Launch")',
  'button:has-text("Play")',
  'button:has-text("Begin")',
  'button:has-text("Go")',
  'a:has-text("Start")',
  'a:has-text("Try")',
  'a:has-text("Launch")',
  '[data-testid="primary-cta"]',
  '.cta-button',
  '.primary-button',
];

test.describe('Apps & Tools - Discovery from /apps', () => {
  test('Discover all app cards on /apps page', async ({ page }) => {
    await page.goto('/apps');
    await page.waitForLoadState('networkidle');
    
    // Find all app links
    const appLinks = await page.locator('a[href^="/apps/"]').all();
    const discovered: string[] = [];
    
    for (const link of appLinks) {
      const href = await link.getAttribute('href');
      if (href && !discovered.includes(href)) {
        discovered.push(href);
        const name = await link.textContent();
        console.log(`Discovered: ${href} - ${name?.trim().substring(0, 30)}`);
      }
    }
    
    console.log(`\nTotal apps discovered: ${discovered.length}`);
    expect(discovered.length).toBeGreaterThan(0);
    
    // Save discovered apps
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    fs.writeFileSync('test-results/discovered-apps.json', JSON.stringify(discovered, null, 2));
  });
});

test.describe('Apps & Tools - Individual App Tests', () => {
  for (const app of APP_ROUTES) {
    test(`App: ${app.name} (${app.path})`, async ({ page }) => {
      setupErrorCapture(page, app.path);
      
      const result: AppTestResult = {
        path: app.path,
        name: app.name,
        status: 0,
        hasCTA: false,
        ctaWorked: false,
        errors: [],
        timestamp: new Date().toISOString(),
      };
      
      // Navigate to app
      const response = await page.goto(app.path, { waitUntil: 'networkidle', timeout: 30000 });
      result.status = response?.status() || 0;
      
      // Skip if 404
      if (result.status === 404) {
        console.log(`${app.path} returns 404 - skipping`);
        appResults.push(result);
        return;
      }
      
      expect(result.status).toBeLessThan(500);
      
      // Check for crash screens
      const crashCount = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
      if (crashCount > 0) {
        result.errors.push('Crash screen detected');
      }
      expect(crashCount, `${app.path} shows crash screen`).toBe(0);
      
      await page.screenshot({ path: `test-results/apps/${app.name.replace(/\s+/g, '-').toLowerCase()}-initial.png` });
      
      // Find and test primary CTA
      for (const pattern of CTA_PATTERNS) {
        const cta = page.locator(pattern).first();
        if (await cta.count() > 0 && await cta.isVisible()) {
          result.hasCTA = true;
          const ctaText = await cta.textContent();
          console.log(`Found CTA: "${ctaText?.trim()}" in ${app.path}`);
          
          try {
            // Click CTA
            await cta.click({ timeout: 5000 });
            await page.waitForTimeout(2000);
            await page.waitForLoadState('networkidle').catch(() => {});
            
            // Check for crash after CTA click
            const postClickCrash = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
            if (postClickCrash === 0) {
              result.ctaWorked = true;
            } else {
              result.errors.push('Crash after CTA click');
            }
            
            await page.screenshot({ path: `test-results/apps/${app.name.replace(/\s+/g, '-').toLowerCase()}-after-cta.png` });
          } catch (e) {
            result.errors.push(`CTA click failed: ${e}`);
          }
          
          break;
        }
      }
      
      if (!result.hasCTA) {
        console.log(`No CTA found in ${app.path}`);
      }
      
      appResults.push(result);
    });
  }
});

test.describe('Apps & Tools - Comprehensive /apps Click Test', () => {
  test('Click every app card from /apps directory', async ({ page }) => {
    setupErrorCapture(page, '/apps');
    
    await page.goto('/apps');
    await page.waitForLoadState('networkidle');
    
    // Get all unique app hrefs
    const appLinks = await page.locator('a[href^="/apps/"]:not([href="/apps"])').all();
    const hrefs: string[] = [];
    
    for (const link of appLinks) {
      const href = await link.getAttribute('href');
      if (href && !hrefs.includes(href)) {
        hrefs.push(href);
      }
    }
    
    console.log(`Found ${hrefs.length} unique app links to test`);
    
    const results: { href: string; status: string; error?: string }[] = [];
    
    for (const href of hrefs) {
      // Navigate directly to each app
      try {
        const response = await page.goto(href, { waitUntil: 'networkidle', timeout: 20000 });
        const status = response?.status() || 0;
        
        if (status >= 500) {
          results.push({ href, status: `${status} ERROR` });
          continue;
        }
        
        const crashCount = await page.locator('text=/Application error|Unhandled Runtime Error/i').count();
        if (crashCount > 0) {
          results.push({ href, status: 'CRASH', error: 'Crash screen detected' });
        } else {
          results.push({ href, status: 'OK' });
        }
      } catch (e) {
        results.push({ href, status: 'TIMEOUT', error: String(e) });
      }
    }
    
    // Log results
    console.log('\n=== App Click Test Results ===');
    for (const r of results) {
      const mark = r.status === 'OK' ? '✓' : '✗';
      console.log(`${mark} ${r.href}: ${r.status}`);
    }
    
    // Save results
    fs.writeFileSync('test-results/app-click-results.json', JSON.stringify(results, null, 2));
    
    const failures = results.filter(r => r.status !== 'OK' && r.status !== '404');
    expect(failures.length, `App click failures: ${failures.map(f => f.href).join(', ')}`).toBe(0);
  });
});

test.afterAll(async () => {
  if (!fs.existsSync('test-results/apps')) {
    fs.mkdirSync('test-results/apps', { recursive: true });
  }
  
  // Save app results
  fs.writeFileSync('test-results/app-test-results.json', JSON.stringify(appResults, null, 2));
  
  if (collectedErrors.length > 0) {
    fs.writeFileSync('test-results/app-errors.json', JSON.stringify(collectedErrors, null, 2));
    console.log(`\n⚠️ ${collectedErrors.length} app errors - see app-errors.json`);
  } else {
    console.log('\n✅ No app errors');
  }
  
  // Summary
  console.log('\n=== App Test Summary ===');
  const passed = appResults.filter(r => r.errors.length === 0);
  const withCTA = appResults.filter(r => r.hasCTA);
  const ctaWorked = appResults.filter(r => r.ctaWorked);
  console.log(`Apps tested: ${appResults.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`With CTA: ${withCTA.length}`);
  console.log(`CTA worked: ${ctaWorked.length}`);
});
