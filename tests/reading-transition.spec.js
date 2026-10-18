import { test, expect } from '@playwright/test';
import { scrollAbout } from './helpers.js';

async function scrollWork(page, progress) {
  await page.evaluate((progress) => {
    const work = document.querySelector('.work');
    scrollTo({ top: work.offsetTop + (work.offsetHeight - innerHeight) * progress, behavior: 'instant' });
  }, progress);
}

async function seekCards(page, time) {
  return page.evaluate((time) => {
    const nodes = [...document.querySelectorAll('.visual-card, .category-card-ghost')];
    nodes.forEach((node) => node.getAnimations().forEach((animation) => { animation.pause(); animation.currentTime = time; }));
    return nodes.map((node) => {
      const style = getComputedStyle(node);
      return { opacity: Number(style.opacity), rotation: new DOMMatrix(style.transform).m13 };
    });
  }, time);
}

test('category panels rotate in perspective without blending old and new images', async ({ page }) => {
  await page.goto('/');
  await scrollWork(page, .05);
  await page.locator('.motion-toggle').click();
  await scrollWork(page, .4);
  await expect(page.locator('.visual-stage')).toHaveClass(/is-category-transitioning/);
  await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', 'project');
  await expect(page.locator('.visual-stage')).toHaveCSS('perspective', '1400px');
  await expect(page.locator('.category-card-ghost img')).toHaveCount(1);
  const outgoing = await seekCards(page, 170);
  expect(outgoing[0].opacity).toBe(0);
  expect(outgoing[1].opacity).toBeGreaterThan(0);
  expect(Math.abs(outgoing[1].rotation)).toBeGreaterThan(.1);
  const incoming = await seekCards(page, 450);
  expect(incoming[0].opacity).toBeGreaterThan(0);
  expect(incoming[1].opacity).toBe(0);
  expect(Math.abs(incoming[0].rotation)).toBeGreaterThan(.01);
  await page.locator('.visual-card').evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
  await expect(page.locator('.visual-stage')).not.toHaveClass(/is-category-transitioning/);
  await expect(page.locator('.category-card-ghost')).toHaveCount(0);
  await expect(page.locator('.visual-card')).toHaveCSS('transform', 'none');
  await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', 'orbit');
});

test('automatic slides wait until the category rotation finishes, then get a full interval', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await scrollWork(page, .05);
  await scrollWork(page, .4);
  await expect(page.locator('.visual-stage')).toHaveClass(/is-category-transitioning/);
  await seekCards(page, 100);
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 50));
  await page.clock.runFor(10000);
  await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', 'orbit');
  await page.locator('.visual-card').evaluate((node) => node.getAnimations().forEach((animation) => animation.finish()));
  await expect(page.locator('.visual-stage')).not.toHaveClass(/is-category-transitioning/);
  await page.clock.runFor(3590);
  await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', 'orbit');
  await page.clock.runFor(30);
  await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', 'common');
  await expect(page.locator('.category-card-ghost')).toHaveCount(0);
  await expect(page.locator('.visual-card')).toHaveCSS('transform', 'none');
});

test('rapid category changes cancel stale panels and reduced motion settles immediately', async ({ page }) => {
  await page.goto('/');
  await scrollWork(page, .4);
  await expect(page.locator('.visual-stage')).toHaveClass(/is-category-transitioning/);
  await seekCards(page, 100);
  await scrollWork(page, .75);
  await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', 'vibe-coding');
  await expect(page.locator('.category-card-ghost')).toHaveCount(1);
  await scrollWork(page, .05);
  await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', 'redesign');
  await expect(page.locator('.visual-stage')).not.toHaveClass(/is-category-transitioning/);
  await expect(page.locator('.category-card-ghost')).toHaveCount(0);
  await expect(page.locator('.project-image[aria-hidden="false"]')).toHaveAttribute('data-project', 'tangle');
  await scrollWork(page, .4);
  await expect(page.locator('.visual-stage')).toHaveClass(/is-category-transitioning/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.visual-stage')).not.toHaveClass(/is-category-transitioning/);
  await expect(page.locator('.category-card-ghost')).toHaveCount(0);
  await expect(page.locator('.visual-card')).toHaveCSS('transform', 'none');
  await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', 'orbit');
});

test('About stays a flowing list with all three contents visible and only the left statement sticky', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.about-information')).toHaveCSS('position', 'static');
  await expect(page.locator('.about-principle[aria-hidden]')).toHaveCount(0);
  for (const step of [0, 1, 2, 1]) {
    await scrollAbout(page, step);
    await expect(page.locator('.about-principle').nth(step)).toHaveCSS('opacity', '1');
    const states = await page.locator('.about-principle').evaluateAll((nodes) => nodes.map((node) => ({ y: node.getBoundingClientRect().top, visibility: getComputedStyle(node).visibility, display: getComputedStyle(node).display, opacity: Number(getComputedStyle(node).opacity) })));
    expect(states.every((state) => state.visibility === 'visible' && state.display !== 'none' && state.opacity >= .35)).toBe(true);
    expect(states[1].y).toBeGreaterThan(states[0].y + 250);
    expect(states[2].y).toBeGreaterThan(states[1].y + 250);
  }
  await scrollAbout(page, 0);
  const before = await page.locator('.about-principles').boundingBox();
  const oldY = await page.evaluate(() => scrollY);
  await page.evaluate(() => scrollBy({ top: 120, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(oldY + 120);
  const after = await page.locator('.about-principles').boundingBox();
  expect(Math.round(before.y - after.y)).toBe(120);
  expect(Math.round((await page.locator('.about-statement').boundingBox()).y)).toBe(90);
});

test('About holds emphasis until the next heading reaches the upper reading line', async ({ page }) => {
  await page.goto('/');
  await page.locator('.about-principle h3').nth(1).evaluate((heading) => scrollTo({ top: heading.getBoundingClientRect().top + scrollY - innerHeight * .42, behavior: 'instant' }));
  const first = page.locator('.about-principle').nth(0);
  const second = page.locator('.about-principle').nth(1);
  await expect(first).toHaveClass(/is-keyword-active/);
  await page.evaluate(() => scrollBy({ top: 20, behavior: 'instant' }));
  await expect(first).toHaveClass(/is-keyword-active/);
  await expect(first).toHaveCSS('opacity', '1');
  await page.evaluate(() => scrollBy({ top: 60, behavior: 'instant' }));
  await expect(second).toHaveClass(/is-keyword-active/);
  await expect(second).toHaveCSS('opacity', '1');
  await page.evaluate(() => scrollBy({ top: -20, behavior: 'instant' }));
  await expect(second).toHaveClass(/is-keyword-active/);
  await expect(second).toHaveCSS('transform', 'none');
  await page.evaluate(() => scrollBy({ top: -100, behavior: 'instant' }));
  await expect(first).toHaveClass(/is-keyword-active/);
  await expect(first).toHaveCSS('opacity', '1');
});

test('About keeps the requested four lines without wrapping throughout the scroll and across widths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const lines = ['좋은 디자인은', '복잡한 정보를', '명확한 경험으로', '바꾸는 것이라고 생각합니다.'];
  for (const width of [320, 390, 820, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#about-heading .motion-line')).toHaveText(lines);
    const fit = await page.locator('#about-heading').evaluate((heading) => [...heading.querySelectorAll('.motion-line')].every((line) => {
      const range = document.createRange(); range.selectNodeContents(line);
      return getComputedStyle(line).whiteSpace === 'nowrap' && range.getBoundingClientRect().width <= heading.clientWidth + 1;
    }));
    expect(fit).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const step of [0, 1, 2]) {
    await scrollAbout(page, step);
    await expect(page.locator('#about-heading .motion-line')).toHaveText(lines);
    await expect(page.locator('.about-principle[aria-hidden]')).toHaveCount(0);
  }
});

test('About keeps all content readable on mobile and through reduced-motion changes', async ({ page }) => {
  await page.goto('/');
  await scrollAbout(page, 1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.about')).not.toHaveClass(/is-reading-focused/);
  for (const principle of await page.locator('.about-principle').all()) await expect(principle).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.about')).toHaveClass(/is-reading-focused/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.about-statement')).toHaveCSS('position', 'static');
  await expect(page.locator('.about-information')).toHaveCSS('position', 'static');
  for (const principle of await page.locator('.about-principle').all()) {
    await expect(principle).toHaveCSS('visibility', 'visible');
    await expect(principle).not.toHaveAttribute('aria-hidden');
  }
});
