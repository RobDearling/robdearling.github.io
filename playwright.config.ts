import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  webServer: [{
    command: 'npm run build && npx serve out -l 3000',
    url: 'http://127.0.0.1:3000',
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  }, {
    command: 'node node_modules/next/dist/bin/next dev studio -H 127.0.0.1 -p 3111',
    url: 'http://127.0.0.1:3111/api/documents',
    env: { EXPLAINER_DIRECTORY: path.resolve('test-results/studio-documents'), STUDIO_BUILD_DIR: '.next-e2e' },
  }],
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
