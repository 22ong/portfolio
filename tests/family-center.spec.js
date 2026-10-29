import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const originals = [
  { path: '/redesign/', selector: '.work-thumbnail img', file: 'cover.png', width: 1920, height: 950, sha: 'b4560bc403702aa9083e73a56fd84df2586cd182e33b5f6d9e7dfdfb44185848' },
  { path: '/redesign/family-center', selector: '.family-center-portfolio', file: 'portfolio.png', width: 1920, height: 9154, sha: '8144f28bd1d934cc8e6d6e55fc8cef2669674b097c04fe65afccb1a0d1f3de02' },
];

test('family center serves the two original PNGs byte-for-byte without processing', async ({ page, request }) => {
  await page.goto('/redesign/family-center');
  for (const image of originals) {
    await page.goto(image.path);
    const source = await readFile(new URL(`../src/assets/family-center/${image.file}`, import.meta.url));
    expect(createHash('sha256').update(source).digest('hex')).toBe(image.sha);
    const url = await page.locator(image.selector).first().getAttribute('src');
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    expect(createHash('sha256').update(await response.body()).digest('hex')).toBe(image.sha);
  }
  await expect(page.locator('.family-center-image')).toHaveCount(1);
  await expect(page.locator('.family-center-cover')).toHaveCount(0);
  await expect(page.locator('.detail-preparing')).toHaveCount(0);
});

test('the full portfolio keeps its original aspect ratio across screen sizes without an extra cover', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/redesign/family-center');
  await page.locator('.family-center-image').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await expect(page.locator('.family-center-image')).toHaveCount(1);
  for (const width of [320, 390, 820, 1440, 1920, 2560]) {
    await page.setViewportSize({ width, height: 1000 });
    const images = await page.locator('.family-center-image').evaluateAll((nodes) => nodes.map((image) => {
      const rect = image.getBoundingClientRect(), style = getComputedStyle(image);
      return { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height, nativeWidth: image.naturalWidth, nativeHeight: image.naturalHeight, shadow: style.boxShadow, transform: style.transform, display: style.display };
    }));
    images.forEach((image) => {
      expect(image.nativeWidth).toBe(originals[1].width);
      expect(image.nativeHeight).toBe(originals[1].height);
      expect(image.width).toBeLessThanOrEqual(1280);
      expect(Math.abs(image.height - image.width * image.nativeHeight / image.nativeWidth)).toBeLessThan(1);
      expect(image.shadow).toBe('none');
      expect(image.transform).toBe('none');
      expect(image.display).toBe('block');
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('family center is reached from the unchanged list and its bottom navigation works', async ({ page }) => {
  await page.goto('/redesign/');
  await page.locator('.work-thumbnail').first().click();
  await expect(page.locator('.family-center-detail')).toBeVisible();
  await expect(page.locator('.header .nav-link').first()).toHaveAttribute('href', '/#work');
  const images = await page.locator('.family-center-image').all();
  const last = await images.at(-1).boundingBox();
  const nav = await page.locator('.family-center-navigation').boundingBox();
  expect(nav.y).toBeGreaterThan(last.y + last.height);
  await page.locator('.family-center-next').click();
  await expect(page).toHaveURL(/\/redesign\/tangle\/$/);
  await expect(page.locator('h1')).toHaveText('TANGLE.');
  await page.goto('/redesign/family-center');
  await page.locator('.family-center-navigation').getByRole('link', { name: 'BACK TO WORK' }).click();
  await expect(page).toHaveURL(/\/#work$/);
  await expect.poll(() => page.locator('.work-sticky').evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(0);
});
