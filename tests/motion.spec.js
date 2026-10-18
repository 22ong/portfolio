import { test, expect } from '@playwright/test';
import { scrollAbout } from './helpers.js';

// Record real Web Animations so their rendering can be sampled deterministically,
// independently of machine speed or font-loading time. No effects are mocked.
async function recordMotion(page) {
  await page.addInitScript(() => {
    window.motionTracks = [];
    const original = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      const animation = original.apply(this, args);
      window.motionTracks.push({ element: this, animation });
      return animation;
    };
  });
  await page.goto('/');
  await expect(page.locator('.hero-target')).toHaveClass(/is-revealed/);
}

async function seek(page, selector, time) {
  await page.evaluate(({ selector, time }) => {
    for (const { element, animation } of window.motionTracks) {
      if (!element.matches(selector)) continue;
      animation.pause();
      animation.currentTime = time;
    }
  }, { selector, time });
}

async function opacities(page, selector) {
  return page.locator(selector).evaluateAll((nodes) => nodes.map((node) => Number(getComputedStyle(node).opacity)));
}

test('Hero lines reveal in order, followed by introduction and graphic', async ({ page }) => {
  await recordMotion(page);
  const selector = '#hero-heading .motion-line, .hero-intro > *, .hero-arrow';
  await seek(page, selector, 100);
  const early = await opacities(page, '#hero-heading .motion-line');
  expect(early[0]).toBeGreaterThan(0);
  expect(early[1]).toBe(0);
  expect(await opacities(page, '.hero-intro > *')).toEqual([0, 0, 0]);
  await expect(page.locator('.hero-arrow')).toHaveCSS('opacity', '0');
  await seek(page, selector, 950);
  expect(await opacities(page, '#hero-heading .motion-line')).toEqual([1, 1]);
  expect((await opacities(page, '.hero-intro > *'))[0]).toBeGreaterThan(0);
  await expect(page.locator('.hero-arrow')).toHaveCSS('opacity', '0');
  await seek(page, selector, 2200);
  expect(await opacities(page, '#hero-heading .motion-line')).toEqual([1, 1]);
  await expect(page.locator('.hero-arrow')).toHaveCSS('opacity', '1');
});

test('Contact masks its three lines in sequence and reveals the point afterward', async ({ page }) => {
  await recordMotion(page);
  const selector = '.contact-title-link .motion-line, .contact-period';
  await seek(page, selector, 180);
  const lines = await opacities(page, '.contact-title-link .motion-line');
  expect(lines[0]).toBeGreaterThan(lines[1]);
  expect(lines[1]).toBeGreaterThan(0);
  expect(lines[2]).toBe(0);
  expect(await page.locator('.contact-title-link .motion-line').first().evaluate((node) => getComputedStyle(node).clipPath)).not.toBe('none');
  await expect(page.locator('.contact-period')).toHaveCSS('opacity', '0');
  await seek(page, selector, 980);
  expect(await opacities(page, '.contact-title-link .motion-line')).toEqual([1, 1, 1]);
  await expect(page.locator('.contact-period')).toHaveCSS('opacity', '0');
  await seek(page, selector, 1600);
  await expect(page.locator('.contact-period')).toHaveCSS('opacity', '1');
});

test('About emphasizes one flowing keyword while every principle remains visible', async ({ page }) => {
  await page.goto('/');
  const principles = page.locator('.about-principle');
  for (const index of [0, 1, 2, 1]) {
    const current = principles.nth(index);
    await scrollAbout(page, index);
    await expect(current).toHaveClass(/is-keyword-active/);
    await expect(current).toHaveCSS('opacity', '1');
    for (const other of [0, 1, 2].filter((item) => item !== index)) {
      await expect(principles.nth(other)).toHaveCSS('opacity', '0.35');
      await expect(principles.nth(other)).not.toHaveAttribute('aria-hidden');
    }
    await expect(principles).toHaveCount(3);
    for (const principle of await principles.all()) await expect(principle).toHaveCSS('visibility', 'visible');
  }
});

test('fast jumps complete passed reveals and never leave visible content hidden', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await expect(page.locator('.contact-footer')).toHaveClass(/is-revealed/);
  await expect(page.locator('.contact-footer')).toHaveCSS('opacity', '1');
  expect(await opacities(page, '.contact-title-link .motion-line')).toEqual([1, 1, 1]);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  expect(await opacities(page, '#hero-heading .motion-line')).toEqual([1, 1]);
  for (const selector of ['#work-heading', '.about-section-label', '.contact > .new-section-topline .eyebrow']) {
    await expect(page.locator(selector)).toHaveClass(/is-revealed/);
    await expect(page.locator(selector)).toHaveCSS('opacity', '1');
  }
});

test('changing reduced motion during a reveal makes every heading and keyword immediately readable', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveClass(/motion-enabled/);
  const states = await page.locator('.motion-line, .about-principle, .about-tools, .contact-period, .contact-footer').evaluateAll((nodes) => nodes.map((node) => ({ opacity: getComputedStyle(node).opacity, transform: getComputedStyle(node).transform, clip: getComputedStyle(node).clipPath })));
  expect(states.every((state) => state.opacity === '1' && state.transform === 'none' && state.clip === 'none')).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect(await opacities(page, '#hero-heading .motion-line')).toEqual([1, 1]);
});
