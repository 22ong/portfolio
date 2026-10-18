import { test, expect, devices } from '@playwright/test';

async function scrollWork(page, progress) {
  await page.evaluate((progress) => {
    const work = document.querySelector('.work');
    const sticky = document.querySelector('.work-sticky');
    window.scrollTo({ top: work.offsetTop + (work.offsetHeight - sticky.offsetHeight) * progress, behavior: 'instant' });
  }, progress);
}

test('hero cursor follows the pointer, restores native cursor and links to work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('명확하게 보여주고,');
  const target = page.locator('.hero-target');
  await target.hover({ position: { x: 180, y: 100 } });
  await expect(page.locator('.project-cursor')).toHaveClass(/is-visible/);
  await expect(target).toHaveCSS('cursor', 'none');
  await page.mouse.move(600, 500);
  await expect.poll(() => page.locator('.project-cursor').evaluate((node) => Math.round(node.getBoundingClientRect().x + node.getBoundingClientRect().width / 2))).toBe(600);
  await page.mouse.move(25, 25);
  await expect(page.locator('.project-cursor')).not.toHaveClass(/is-visible/);
  await expect(target).not.toHaveCSS('cursor', 'none');
  await target.click();
  await expect.poll(() => page.locator('.work-sticky').evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(0);
  await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', 'redesign');
});

test('scroll pins work through all categories, reverses, then releases after VIBE CODING', async ({ page }) => {
  await page.goto('/');
  for (const [progress, category] of [[0.08, 'redesign'], [0.4, 'project'], [0.77, 'vibe-coding'], [0.95, 'vibe-coding'], [0.4, 'project'], [0.08, 'redesign']]) {
    await scrollWork(page, progress);
    await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', category);
    await expect.poll(() => page.locator('.work-sticky').evaluate((node) => node.getBoundingClientRect().top)).toBe(0);
  }
  await page.evaluate(() => {
    const work = document.querySelector('.work');
    window.scrollTo({ top: work.offsetTop + work.offsetHeight - innerHeight + 60, behavior: 'instant' });
  });
  await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', 'vibe-coding');
  await expect(page.locator('#about')).toBeInViewport();
  await expect.poll(() => page.locator('.work-sticky').evaluate((node) => node.getBoundingClientRect().top)).toBeLessThan(0);
});

test('every category automatically cycles only its own images and loops', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  for (const [progress, ids] of [[0.05, ['tangle', 'monami', 'forma']], [0.4, ['orbit', 'common']], [0.75, ['motion', 'field']]]) {
    await scrollWork(page, progress);
    await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', ids[0]);
    await expect(page.locator('.visual-stage')).not.toHaveClass(/is-category-transitioning/);
    for (let i = 1; i <= ids.length; i++) {
      await page.clock.fastForward(3700);
      await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', ids[i % ids.length]);
      await expect(page.locator('.project-image[aria-hidden="false"]')).toHaveCount(1);
    }
  }
});

test('each desktop category remains pinned for more than one viewport of scrolling', async ({ page }) => {
  await page.goto('/');
  const top = await page.locator('.work').evaluate((node) => node.offsetTop);
  const height = page.viewportSize().height;
  for (const [screens, category] of [[0.05, 'redesign'], [1.5, 'redesign'], [2.05, 'project'], [3.5, 'project'], [4.05, 'vibe-coding'], [5.5, 'vibe-coding']]) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), top + screens * height);
    await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', category);
    await expect.poll(() => page.locator('.work-sticky').evaluate((node) => node.getBoundingClientRect().top)).toBe(0);
  }
});

test('category changes cancel outgoing fades and restart a full autoplay interval from index zero', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 100));
  async function scrollWithPausedClock(progress) {
    // Native scroll events are delivered on a browser frame independently of
    // Playwright's clock. Wait for delivery before advancing the app's RAF.
    await page.evaluate((progress) => new Promise((resolve) => {
      const work = document.querySelector('.work');
      const sticky = document.querySelector('.work-sticky');
      addEventListener('scroll', resolve, { once: true });
      scrollTo({ top: work.offsetTop + (work.offsetHeight - sticky.offsetHeight) * progress, behavior: 'instant' });
    }), progress);
    await page.clock.runFor(32);
  }
  await scrollWithPausedClock(0.05);
  // Switch categories while the first category's automatic fade is in flight.
  await page.clock.runFor(3650);
  await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', 'monami');

  for (const [progress, first, second] of [[0.4, 'orbit', 'common'], [0.75, 'motion', 'field'], [0.05, 'tangle', 'monami']]) {
    await scrollWithPausedClock(progress);
    await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', first);
    // The automatic slide layers reset immediately. A separate snapshot panel
    // carries the outgoing category during its rotation.
    const opacities = await page.locator('.project-image').evaluateAll((images) => images.map((image) => ({ id: image.dataset.project, opacity: Number(getComputedStyle(image).opacity) })));
    expect(opacities.filter((image) => image.id !== first).every((image) => image.opacity === 0)).toBe(true);
    expect(opacities.find((image) => image.id === first).opacity).toBe(1);
    await expect(page.locator('.visual-stage')).not.toHaveClass(/is-category-transitioning/);
    await expect(page.locator('.category-card-ghost')).toHaveCount(0);
    await page.clock.runFor(3400);
    await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', first);
    await page.clock.runFor(250);
    await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', second);
  }
});

test('autoplay can pause and resume, and respects reduced motion', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await scrollWork(page, 0.05);
  await page.getByRole('button', { name: '대표 이미지 자동 전환 일시정지' }).click();
  await page.clock.fastForward(8000);
  await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', 'tangle');
  await page.getByRole('button', { name: '대표 이미지 자동 전환 재생' }).click();
  await page.clock.fastForward(3700);
  await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', 'monami');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.motion-toggle')).toBeDisabled();
  await page.clock.fastForward(8000);
  await expect(page.locator('.project-image.is-visible')).toHaveAttribute('data-project', 'monami');
  await scrollWork(page, 0.75);
  await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', 'vibe-coding');
});

test('unfinished categories keep a keyboard accessible placeholder without navigation', async ({ page }) => {
  await page.goto('/');
  await scrollWork(page, 0.05);
  const category = page.locator('[data-category-link="project"]');
  await category.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#dialog-heading')).toHaveText('PROJECT');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(category).toBeFocused();
});

test('all images and local fonts load, with no browser or network errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  expect(await page.locator('.project-image').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('600 24px "Noto Sans KR Variable"', '명확하게'))).toBe(true);
  expect(errors).toEqual([]);
});

test('desktop widths have no horizontal overflow and keep content inside the sticky viewport', async ({ page }) => {
  await page.goto('/');
  for (const [width, height] of [[1920, 1080], [1440, 900], [1280, 720], [1024, 768], [820, 1180]]) {
    await page.setViewportSize({ width, height });
    await scrollWork(page, 0.4);
    await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', 'project');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const frame = await page.locator('.work-sticky').boundingBox();
    const meta = await page.locator('.project-meta').boundingBox();
    expect(meta.y + meta.height).toBeLessThan(frame.y + frame.height - 25);
  }
});

test('touch layout stacks, has no custom cursor and still switches categories', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 13'], baseURL: 'http://127.0.0.1:5173' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.project-cursor')).toHaveCSS('display', 'none');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const [progress, category] of [[0.05, 'redesign'], [0.4, 'project'], [0.75, 'vibe-coding']]) {
    await scrollWork(page, progress);
    await expect(page.locator('.category-row.is-active')).toHaveAttribute('data-category', category);
    const description = await page.locator('.category-description').boundingBox();
    const visual = await page.locator('.visual-stage').boundingBox();
    expect(visual.y).toBeGreaterThan(description.y + description.height);
  }
  await context.close();
});
