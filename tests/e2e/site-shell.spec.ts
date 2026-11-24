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

for (const path of ['/blog', '/weekly-notes']) {
  test(`${path} uses the full site width for the index and entry`, async ({ page }) => {
    await page.goto(path);
    const headerWidth = await page.locator('.site-header').evaluate(header => getComputedStyle(header).width);
    await expect(page.locator('.page-intro')).toHaveCSS('width', headerWidth);
    await expect(page.locator('.entry-list')).toHaveCSS('width', headerWidth);

    await page.locator('.entry-title a').first().click();
    await expect(page.locator('.article-content')).toHaveCSS('width', headerWidth);
  });
}

test('the masthead trace belongs to the page and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const header = page.locator('header.site-header');
  await expect(header.getByRole('link', { name: /rob dearling/i })).toContainText('Rob Dearling');
  const trace = header.locator('svg[aria-hidden="true"] path');
  await expect(trace).toBeVisible();
  await expect(trace).toHaveCSS('animation-name', 'none');
  const homeTrace = await trace.getAttribute('d');

  await page.locator('.lead-story h2 a').click();
  await expect(page.locator('article h1')).toBeVisible();
  await expect(trace).not.toHaveAttribute('d', homeTrace!);
  const articleTrace = await trace.getAttribute('d');
  await page.reload();
  await expect(trace).toHaveAttribute('d', articleTrace!);
});

test('keyboard focus is visible on the first navigation link', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Rob Dearling home' })).toBeFocused();
  await page.keyboard.press('Tab');
  const homeLink = page.getByRole('navigation').getByRole('link', { name: 'Home' });
  await expect(homeLink).toBeFocused();
  await expect(homeLink).toHaveCSS('outline-style', 'solid');
});
