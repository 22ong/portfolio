// Same visual style and .18 interpolation as HERO, with hit testing so a
// stationary pointer stays correct while the document scrolls underneath it.
export function initHoverCursor(targets, cursor) {
  const fine = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = null, followFrame = 0, hitFrame = 0;
  let hasPointer = false;
  let x = 0, y = 0, mouseX = 0, mouseY = 0;

  function follow() {
    const ease = reduced.matches ? 1 : .18;
    x += (mouseX - x) * ease;
    y += (mouseY - y) * ease;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    if (active) followFrame = requestAnimationFrame(follow);
  }
  function setActive(target) {
    if (target === active) return;
    active?.classList.remove('has-work-cursor');
    const wasVisible = Boolean(active);
    active = target;
    if (!active) {
      cursor.classList.remove('is-visible');
      cancelAnimationFrame(followFrame);
      return;
    }
    if (!wasVisible) {
      x = mouseX; y = mouseY;
      follow();
    }
    active.classList.add('has-work-cursor');
    cursor.classList.add('is-visible');
  }
  function hitTest() {
    hitFrame = 0;
    const hit = fine.matches && hasPointer ? document.elementFromPoint(mouseX, mouseY)?.closest('[data-work-cursor]') : null;
    setActive(targets.includes(hit) ? hit : null);
  }
  function queueHitTest() { if (!hitFrame) hitFrame = requestAnimationFrame(hitTest); }
  function reset() {
    hasPointer = false;
    cancelAnimationFrame(hitFrame);
    hitFrame = 0;
    setActive(null);
  }
  document.addEventListener('pointermove', (event) => {
    if (!fine.matches || event.pointerType === 'touch') { reset(); return; }
    hasPointer = true;
    mouseX = event.clientX; mouseY = event.clientY;
    hitTest();
  });
  document.addEventListener('pointerout', (event) => { if (!event.relatedTarget) reset(); });
  document.addEventListener('pointercancel', reset);
  targets.forEach((target) => {
    target.addEventListener('click', reset);
    target.addEventListener('dragstart', (event) => event.preventDefault());
  });
  // Never clear an active hover merely because a scroll event fired. Test the
  // actual topmost element on the next paint, including entering another image.
  addEventListener('scroll', queueHitTest, { passive: true });
  addEventListener('resize', queueHitTest);
  addEventListener('blur', reset);
  addEventListener('pagehide', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  fine.addEventListener('change', reset);
}
