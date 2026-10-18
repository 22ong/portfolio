import { test, expect } from '@playwright/test';

async function sample(page, kind, seconds) {
  return page.locator(`[data-orbit="${kind}"]`).evaluate(async (svg, { kind, seconds }) => {
    svg.pauseAnimations();
    svg.setCurrentTime(seconds);
    await new Promise(requestAnimationFrame);
    const path = svg.querySelector('.orbit-line');
    const marker = svg.querySelector('.orbit-traveler');
    const actual = new DOMPoint(0, 0).matrixTransform(marker.getCTM());
    const period = kind === 'contact' ? 72 : 110;
    const progress = (seconds % period) / period;
    const local = path.getPointAtLength(path.getTotalLength() * progress);
    const expected = new DOMPoint(local.x, local.y).matrixTransform(path.getCTM());
    return { x: actual.x, y: actual.y, distanceFromPath: Math.hypot(actual.x - expected.x, actual.y - expected.y) };
  }, { kind, seconds });
}

test('Contact point follows the actual curve and loops seamlessly at desktop and mobile sizes', async ({ page }) => {
  await page.goto('/');
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await expect.poll(() => page.locator('[data-orbit="contact"]').evaluate((svg) => svg.viewBox.baseVal.width)).toBe(width);
    const start = await sample(page, 'contact', 0);
    for (const seconds of [18, 36, 54, 72]) {
      const point = await sample(page, 'contact', seconds);
      expect(point.distanceFromPath).toBeLessThan(2);
      if (seconds === 18) expect(Math.hypot(point.x - start.x, point.y - start.y)).toBeGreaterThan(100);
      if (seconds === 72) expect(Math.hypot(point.x - start.x, point.y - start.y)).toBeLessThan(1);
    }
    await expect(page.locator('[data-orbit="contact"] circle')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('Hero has a large orbit and a slower point loop with a single introductory line draw', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-orbit="hero"] .orbit-line')).toHaveCount(1);
  await expect(page.locator('[data-orbit="hero"] circle')).toHaveCount(1);
  const start = await sample(page, 'hero', 0);
  const width = await page.locator('[data-orbit="hero"]').evaluate((svg) => svg.getBoundingClientRect().width / innerWidth);
  expect(width).toBeGreaterThanOrEqual(.65);
  expect(width).toBeLessThanOrEqual(.9);
  const middle = await sample(page, 'hero', 27.5);
  expect(Math.hypot(middle.x - start.x, middle.y - start.y)).toBeGreaterThan(100);
  expect(middle.distanceFromPath).toBeLessThan(2);
  const end = await sample(page, 'hero', 110);
  expect(Math.hypot(end.x - start.x, end.y - start.y)).toBeLessThan(1);
  const draw = page.locator('[data-orbit="hero"] .orbit-line');
  await draw.evaluate((path) => { const animation = path.getAnimations()[0]; animation.pause(); animation.currentTime = 1500; });
  await expect(draw).toHaveCSS('stroke-dashoffset', '1px');
  await draw.evaluate((path) => { path.getAnimations()[0].currentTime = 4500; });
  await expect(draw).toHaveCSS('stroke-dashoffset', '0px');
});

test('orbit loops pause outside their sections and stop immediately for reduced motion', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('[data-orbit="hero"]');
  const contact = page.locator('[data-orbit="contact"]');
  await expect.poll(() => hero.evaluate((svg) => svg.animationsPaused())).toBe(false);
  await expect.poll(() => contact.evaluate((svg) => svg.animationsPaused())).toBe(true);
  await page.evaluate(() => document.querySelector('#contact').scrollIntoView({ behavior: 'instant' }));
  await expect.poll(() => contact.evaluate((svg) => svg.animationsPaused())).toBe(false);
  await expect.poll(() => hero.evaluate((svg) => svg.animationsPaused())).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => contact.evaluate((svg) => svg.animationsPaused())).toBe(true);
  expect(await contact.evaluate((svg) => svg.getCurrentTime())).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => contact.evaluate((svg) => svg.animationsPaused())).toBe(false);
});

test('Contact graphics do not intercept the unselectable, draggable-disabled email CTA', async ({ page }) => {
  await page.goto('/');
  for (const selector of ['.contact-title-link', '.contact-email']) {
    await expect(page.locator(selector)).toHaveCSS('user-select', 'none');
    await expect(page.locator(selector)).toHaveAttribute('draggable', 'false');
  }
  const email = page.locator('.contact-email');
  await email.scrollIntoViewIfNeeded();
  const hitsEmail = await email.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest('.contact-email') === node;
  });
  expect(hitsEmail).toBe(true);
  await email.click();
  await expect(page.locator('.contact-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.contact-dialog')).not.toBeVisible();
});
