import { expect, test } from '@playwright/test';

const url = '/posts/7-azure-private-endpoints';

test('DNS replies and HTTPS routes follow the selected client and zone', async ({ page }) => {
  await page.goto(url);
  const lab = page.getByRole('figure', { name: 'Where will this upload land?' });
  for (const [client, zone, expected, route] of [
    ['Azure VM', 'Linked to VNet', '10.42.1.5', 'Private Link carries'],
    ['Azure VM', 'Unlinked', 'a public IP', 'Azure backbone'],
    ['External laptop', 'Linked to VNet', 'a public IP', 'over the internet'],
    ['External laptop', 'Unlinked', 'a public IP', 'over the internet'],
  ]) {
    await lab.getByRole('button', { name: client, exact: true }).click();
    await lab.getByRole('button', { name: zone, exact: true }).click();
    await expect(lab).toContainText('Step 1 of 3');
    await lab.getByRole('button', { name: 'Next' }).click();
    await expect(lab).toContainText('DNS returns ' + expected);
    await expect(lab.locator('svg g[data-active=true] title')).toHaveText(client === 'Azure VM' ? 'DNS replies to VM' : 'DNS replies to laptop');
    await lab.getByRole('button', { name: 'Next' }).click();
    await expect(lab).toContainText(route);
    const expectedRoute = client === 'External laptop' ? 'Internet to public endpoint'
      : zone === 'Unlinked' ? 'Azure backbone to public endpoint' : 'HTTPS to 10.42.1.5';
    await expect(lab.locator('svg g[data-active=true] title')).toHaveText([
      expectedRoute, expected === '10.42.1.5' ? 'Private Link to Blob Storage' : 'Public endpoint to Blob Storage',
    ]);
    await expect(lab.getByRole('button', { name: 'Next' })).toBeDisabled();
  }
});

test('playback, replay, keyboard and reduced motion', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  const fig = page.getByRole('figure', { name: 'Reach the public endpoint' });
  const play = fig.getByRole('button', { name: 'Play', exact: true });
  await play.focus();
  await page.keyboard.press('Enter');
  await expect(fig.getByRole('button', { name: 'Pause' })).toBeVisible();
  await expect(fig.locator('path[pathLength="100"]')).toHaveCSS('display', 'none');
  await expect(fig).toContainText('Step 2 of 3');
  await fig.getByRole('button', { name: 'Azure VM' }).click();
  await expect(play).toBeVisible();
  if (isMobile) {
    await fig.getByRole('button', { name: 'Enlarge' }).click();
    const viewport = fig.getByLabel('Scrollable diagram');
    expect(await viewport.evaluate(el => el.scrollWidth > el.clientWidth)).toBeTruthy();
    await fig.getByRole('button', { name: 'Fit diagram' }).click();
  }
  await expect(fig).toContainText('Step 1 of 3');
  await expect(fig.locator('svg g[data-active=true] title')).toHaveText('VM queries DNS');
  await fig.getByRole('button', { name: 'Next' }).click();
  await fig.getByRole('button', { name: 'Back' }).click();
  await expect(fig.getByRole('button', { name: 'Back' })).toBeDisabled();
  await fig.getByRole('button', { name: 'Next' }).click();
  await fig.getByRole('button', { name: 'Next' }).click();
  await fig.getByRole('button', { name: 'Replay' }).click();
  await expect(fig).toContainText('Step 1 of 3');
  await fig.getByRole('button', { name: 'Pause' }).click();
  await expect(play).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test('the static post contains readable prose, figures and initial routes', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto(url);
    await expect(page.getByRole('figure')).toHaveCount(3);
    const figure = page.getByRole('figure', { name: 'Follow the private address' });
    await expect(figure).toContainText('fieldnotes.blob.core.windows.net');
    await expect(figure.locator('svg').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Predict the next destination' })).toBeVisible();
  } finally { await context.close(); }
});
