import { expect, test } from '@playwright/test';

for (const path of ['/', '/blog', '/weekly-notes']) {
  test(`${path} has an editorial shell`, async ({ page }) => {
    await page.goto(path);

    await expect(page.locator('header.site-header')).toBeVisible();
    await expect(page.locator('header.site-header nav')).toBeVisible();
    await expect(page.locator('main.site-main')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toBeVisible();
  });
}

test('masthead uses text instead of animated or graphic branding', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('header.site-header');
  await expect(header.getByRole('link', { name: /rob dearling/i })).toContainText('Rob Dearling');
  await expect(header.locator('canvas, svg')).toHaveCount(0);
});

test('keyboard focus is visible on the first navigation link', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveCSS('outline-style', 'solid');
});
