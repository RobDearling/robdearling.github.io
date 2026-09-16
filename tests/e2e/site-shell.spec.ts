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

test('keyboard focus is visible on the first navigation link', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveCSS('outline-style', 'solid');
});
