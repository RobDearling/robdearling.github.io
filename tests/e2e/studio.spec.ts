import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('compose, save, reopen and play an independent queue diagram', async ({ page, request }) => {
  test.setTimeout(90_000);
  const studio = 'http://127.0.0.1:3111';
  const slug = 'queue-' + randomUUID();
  await page.goto(studio);
  await page.getByRole('button', { name: 'New explainer' }).click();
  await page.getByLabel('Title', { exact: true }).fill('A queue and one worker');
  await page.getByLabel('Filename').fill(slug);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  for (const [name, symbol] of [['Queue', 'queue'], ['Worker', 'worker']]) {
    await page.getByRole('button', { name: 'Add node' }).click();
    await page.getByLabel('Label', { exact: true }).fill(name);
    await page.getByLabel('Symbol').selectOption(symbol);
  }
  await page.getByRole('button', { name: 'Connect nodes' }).click();
  await page.locator('g[data-id=node-1]').click();
  await page.locator('g[data-id=node-2]').click();
  await page.getByLabel('Label', { exact: true }).fill('Deliver message');
  await page.getByRole('button', { name: 'Scenes', exact: true }).click();
  await page.getByLabel('Step caption').fill('A message waits in the queue.');
  await page.getByRole('button', { name: 'Add step' }).click();
  await page.getByLabel('Step caption').fill('The worker receives the message.');
  await page.getByRole('checkbox', { name: /Deliver message/ }).check();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Saved to explainers/');
  await page.reload();
  await page.getByLabel('Open explainer').selectOption(slug);
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.getByLabel('Markdown embed')).toHaveValue('```explainer\n' + slug + '/overview\n```');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('figure')).toContainText('The worker receives the message.');
  await expect(page.locator('svg g[data-active=true] title')).toHaveText('Deliver message');

  const api = studio + '/api/documents/' + slug;
  const stored = await (await request.get(api)).json();
  const response = await request.put(api, { headers: { Origin: studio }, data: { document: stored.document, revision: null } });
  expect(response.status()).toBe(409);
  expect((await (await request.get(api)).json()).revision).toBe(stored.revision);
});
