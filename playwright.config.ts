import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'https://craudiovizai.com',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'safari-mobile',
      use: { ...devices['iPhone 14 Pro Max'] },
    },
    {
      name: 'android',
      use: { ...devices['Pixel 7'] },
    },
  ],
  outputDir: 'test-results/',
});
