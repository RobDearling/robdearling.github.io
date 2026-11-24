import { expect, test } from '@playwright/test';

test('blog entries expose dates and readable linked titles', async ({ page, hasTouch }) => {
  await page.goto('/blog');

  const firstEntry = page.locator('.entry-list > li').first();
  await expect(firstEntry.locator('time')).toBeVisible();
  const title = firstEntry.getByRole('link');
  await expect(title).toBeVisible();
  await expect(title).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect(title).toHaveCSS('font-weight', '400');
  if (!hasTouch) {
    await title.hover();
    await expect(title).toHaveCSS('color', 'rgb(157, 68, 44)');
  }
});
