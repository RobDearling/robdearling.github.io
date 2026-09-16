import { expect, test } from '@playwright/test';

test('blog entries expose dates and readable linked titles', async ({ page }) => {
  await page.goto('/blog');

  const firstEntry = page.locator('.entry-list > li').first();
  await expect(firstEntry.locator('time')).toBeVisible();
  await expect(firstEntry.locator('h2 a')).toBeVisible();
  await expect(firstEntry.locator('h2 a')).toHaveCSS('color', 'rgb(29, 95, 167)');
});
