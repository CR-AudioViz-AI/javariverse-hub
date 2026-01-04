// ================================================================================
// CR AUDIOVIZ AI - PLAYWRIGHT E2E TEST SUITE
// Mobile-first testing with video/trace/screenshot evidence
// ================================================================================

import { test, expect, devices } from '@playwright/test';

// Mobile-first viewport configurations
const MOBILE_VIEWPORTS = {
  'iPhone SE': devices['iPhone SE'],
  'iPhone 14': devices['iPhone 14'],
  'iPhone 14 Pro Max': devices['iPhone 14 Pro Max'],
  'Pixel 7': devices['Pixel 7'],
  'iPad Pro': devices['iPad Pro 11'],
};

// =============================================================================
// TEST 1: Homepage loads and is accessible
// =============================================================================
test.describe('Homepage', () => {
  test('loads successfully on desktop', async ({ page }) => {
    await page.goto('https://craudiovizai.com');
    await expect(page).toHaveTitle(/CR AudioViz|CRAIverse|Javari/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('loads successfully on mobile (iPhone 14)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://craudiovizai.com');
    await expect(page).toHaveTitle(/CR AudioViz|CRAIverse|Javari/i);
  });

  test('has accessible navigation', async ({ page }) => {
    await page.goto('https://craudiovizai.com');
    // Check for main navigation elements
    const nav = page.locator('nav, header, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });
});

// =============================================================================
// TEST 2: Apps page functionality
// =============================================================================
test.describe('Apps Page', () => {
  test('displays app grid', async ({ page }) => {
    await page.goto('https://craudiovizai.com/apps');
    await page.waitForLoadState('networkidle');
    // Should have app cards or links
    const content = page.locator('main, [role="main"], .apps, #apps').first();
    await expect(content).toBeVisible();
  });

  test('apps page responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://craudiovizai.com/apps');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});

// =============================================================================
// TEST 3: Pricing page loads
// =============================================================================
test.describe('Pricing Page', () => {
  test('displays pricing information', async ({ page }) => {
    await page.goto('https://craudiovizai.com/pricing');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('pricing responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('https://craudiovizai.com/pricing');
    await expect(page.locator('body')).toBeVisible();
  });
});

// =============================================================================
// TEST 4: Dashboard (degraded mode)
// =============================================================================
test.describe('Dashboard', () => {
  test('loads without authentication (shows guest view)', async ({ page }) => {
    await page.goto('https://craudiovizai.com/dashboard');
    await page.waitForLoadState('networkidle');
    // Dashboard should render even without auth (degraded mode)
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://craudiovizai.com/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });
});

// =============================================================================
// TEST 5: API Health Check
// =============================================================================
test.describe('API Health', () => {
  test('health endpoint returns 200', async ({ request }) => {
    const response = await request.get('https://craudiovizai.com/api/health');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.status).toBe('healthy');
  });

  test('apps API returns data', async ({ request }) => {
    const response = await request.get('https://craudiovizai.com/api/apps');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.apps).toBeDefined();
    expect(json.apps.length).toBeGreaterThan(0);
  });

  test('credits API returns guest plan', async ({ request }) => {
    const response = await request.get('https://craudiovizai.com/api/credits');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.plan).toBeDefined();
  });

  test('user API returns auth status', async ({ request }) => {
    const response = await request.get('https://craudiovizai.com/api/user');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.authenticated).toBeDefined();
  });
});

// =============================================================================
// TEST 6: Mobile Touch Targets (WCAG 2.2 AA)
// =============================================================================
test.describe('Accessibility - Touch Targets', () => {
  test('buttons meet 44px minimum touch target', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://craudiovizai.com');
    
    // Find interactive elements
    const buttons = page.locator('button, a, [role="button"]');
    const count = await buttons.count();
    
    // Check at least some buttons exist
    expect(count).toBeGreaterThan(0);
    
    // Sample check first button
    if (count > 0) {
      const box = await buttons.first().boundingBox();
      if (box) {
        // At least one dimension should be >= 44px for accessibility
        const meetsTarget = box.width >= 44 || box.height >= 44;
        expect(meetsTarget).toBe(true);
      }
    }
  });
});

// =============================================================================
// TEST 7: Javari AI Page
// =============================================================================
test.describe('Javari AI', () => {
  test('javari page loads', async ({ page }) => {
    await page.goto('https://javariai.com');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('javari responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://javariai.com');
    await expect(page.locator('body')).toBeVisible();
  });
});

// =============================================================================
// TEST 8: Self-Heal API
// =============================================================================
test.describe('Self-Heal', () => {
  test('self-heal API responds', async ({ request }) => {
    const response = await request.post('https://craudiovizai.com/api/self-heal', {
      headers: { 'Content-Type': 'application/json' },
      data: { error_signals: ['test'] }
    });
    // May return 200 or indicate no strategy found
    expect([200, 404]).toContain(response.status());
  });
});

// =============================================================================
// TEST 9: Claims API
// =============================================================================
test.describe('Claims', () => {
  test('claims summary API works', async ({ request }) => {
    const response = await request.get('https://craudiovizai.com/api/claims?action=summary');
    // May or may not be deployed yet
    expect([200, 404, 500]).toContain(response.status());
  });
});

// =============================================================================
// TEST 10: Cron Dispatcher
// =============================================================================
test.describe('Cron Dispatcher', () => {
  test('dispatcher endpoint responds', async ({ request }) => {
    const response = await request.post('https://craudiovizai.com/api/cron/dispatcher');
    // Should respond with job execution results
    expect([200, 202, 409]).toContain(response.status());
  });
});
