import './motion.css';

const EASE = 'cubic-bezier(.2,.65,.3,1)';

// Preserve the existing <br> positions and all nested markup (including the
// HERO underline and contact point). The wrappers carry only paint effects.
function wrapLines(heading) {
  const lines = [];
  let nodes = [];
  function wrap() {
    if (!nodes.length) return;
    const line = document.createElement('span');
    line.className = 'motion-line';
    nodes[0].before(line);
    line.append(...nodes);
    nodes = [];
    lines.push(line);
  }
  for (const node of [...heading.childNodes]) {
    if (node.nodeName === 'BR') wrap();
    else nodes.push(node);
  }
  wrap();
  return lines;
}

export function initMotion() {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const supported = typeof Element.prototype.animate === 'function';
  const groups = [];
  const animations = new Set();
  const transient = new Map();
  let lastScrollY = scrollY;
  let frame = 0;
  const principles = [...document.querySelectorAll('.about-principle')];

  function cancel(animation) {
    if (!animation) return;
    animation.cancel();
    animations.delete(animation);
  }

  function animate(element, { y = 0, delay = 0, duration = 650, mask = false, scale = false, fromOpacity = 0 } = {}, paused = false) {
    if (preference.matches || !supported) return null;
    const from = { opacity: fromOpacity };
    const to = { opacity: 1 };
    if (y) { from.transform = `translateY(${y}px)`; to.transform = 'translateY(0)'; }
    if (scale) { from.transform = 'scale(0)'; to.transform = 'scale(1)'; }
    if (mask) { from.clipPath = 'inset(0 -.1em 100% -.1em)'; to.clipPath = 'inset(-.15em -.1em -.15em -.1em)'; }
    const animation = element.animate([from, to], { duration, delay, easing: EASE, fill: 'both' });
    animations.add(animation);
    if (paused) { animation.pause(); animation.currentTime = 0; }
    animation.onfinish = () => cancel(animation);
    return animation;
  }

  function register(trigger, entries) {
    const group = { trigger, entries, state: 'pending' };
    for (const entry of entries) entry.animation = animate(entry.element, entry, true);
    groups.push(group);
    if (preference.matches || !supported) finish(group);
    return group;
  }

  function finish(group) {
    group.state = 'done';
    group.trigger.classList.add('is-revealed');
    for (const entry of group.entries) {
      cancel(entry.animation);
      entry.element.classList.add('is-revealed');
    }
  }

  function reveal(group, immediate = false) {
    if (group.state !== 'pending') return;
    if (immediate || preference.matches) { finish(group); return; }
    group.state = 'playing';
    group.trigger.classList.add('is-revealed');
    for (const entry of group.entries) {
      entry.element.classList.add('is-revealed');
      entry.animation?.play();
    }
  }

  const heroLines = wrapLines(document.querySelector('#hero-heading'));
  const aboutLines = wrapLines(document.querySelector('#about-heading'));
  const contactLines = wrapLines(document.querySelector('.contact-title-link'));
  register(document.querySelector('.hero-target'), [
    ...heroLines.map((element, index) => ({ element, y: 30, delay: index * 140, duration: 650, mask: true })),
    ...[...document.querySelector('.hero-intro').children].map((element, index) => ({ element, y: 16, delay: 800 + index * 80, duration: 550 })),
    { element: document.querySelector('.hero-arrow'), delay: 1500, duration: 500 },
  ]);

  // One shared treatment for the existing section labels.
  for (const label of document.querySelectorAll('#work-heading, .about-section-label, .contact > .new-section-topline .eyebrow')) {
    register(label, [{ element: label, y: 10, duration: 550 }]);
  }
  register(document.querySelector('#about-heading'), aboutLines.map((element, index) => ({ element, y: 24, delay: index * 100, duration: 650, mask: true })));
  register(document.querySelector('.about-tools'), [{ element: document.querySelector('.about-tools'), y: 16, delay: 60, duration: 600 }]);
  register(document.querySelector('.contact-title-link'), [
    ...contactLines.map((element, index) => ({ element, y: 36, delay: index * 130, duration: 700, mask: true })),
    { element: document.querySelector('.contact-period'), scale: true, delay: 1000, duration: 500 },
  ]);
  register(document.querySelector('.contact-footer'), [{ element: document.querySelector('.contact-footer'), duration: 650 }]);

  function update() {
    frame = 0;
    const jumping = Math.abs(scrollY - lastScrollY) > innerHeight * .7;
    lastScrollY = scrollY;
    for (const group of groups) {
      const rect = group.trigger.getBoundingClientRect();
      // A skipped or already-passed group is immediately readable when revisited.
      if (rect.bottom <= 0 || (jumping && rect.top < innerHeight)) finish(group);
      else if (rect.top < innerHeight - 30 && rect.bottom > 0) reveal(group);
    }
  }
  function queueUpdate() { if (!frame) frame = requestAnimationFrame(update); }

  if ('IntersectionObserver' in window && !preference.matches) {
    const observer = new IntersectionObserver(queueUpdate, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
    groups.forEach((group) => observer.observe(group.trigger));
  }
  addEventListener('scroll', queueUpdate, { passive: true });
  addEventListener('resize', queueUpdate);

  // Observe category state, never alter its scroll calculation or slideshow.
  const rows = [...document.querySelectorAll('.category-row')];
  let lastCategory = rows.findIndex((row) => row.classList.contains('is-active'));
  new MutationObserver(() => {
    const next = rows.findIndex((row) => row.classList.contains('is-active'));
    if (next < 0 || next === lastCategory) return;
    lastCategory = next;
    const rect = document.querySelector('.work-sticky').getBoundingClientRect();
    if (preference.matches || rect.bottom <= 0 || rect.top >= innerHeight) return;
    [rows[next].querySelector('.category-copy'), document.querySelector('.category-description')].forEach((element, index) => {
      cancel(transient.get(element));
      transient.set(element, animate(element, { y: 12, delay: index * 60, duration: 500, fromOpacity: .6 }));
    });
  }).observe(document.querySelector('.category-list'), { subtree: true, attributes: true, attributeFilter: ['class'] });

  function reduceMotion() {
    document.documentElement.classList.toggle('motion-enabled', !preference.matches);
    if (preference.matches) {
      groups.forEach(finish);
      [...animations].forEach(cancel);
      principles.forEach((principle) => principle.classList.add('is-revealed'));
    }
    queueUpdate();
  }
  preference.addEventListener('change', reduceMotion);
  document.addEventListener('focusin', (event) => {
    groups.filter((group) => group.trigger.contains(event.target)).forEach(finish);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) groups.filter((group) => group.state === 'playing').forEach(finish);
  });
  reduceMotion();
}
