import './reading.css';

// Every principle stays in normal document flow. Only opacity changes as its
// heading reaches the upper reading line; the next heading must arrive before
// the current principle loses emphasis. A small dead band prevents flickering.
export function initAboutReading() {
  const section = document.querySelector('.about');
  const principles = [...section.querySelectorAll('.about-principle')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1;
  let frame = 0;
  let lastY = scrollY;

  function select(next) {
    if (next === active) return;
    active = next;
    principles.forEach((principle, index) => principle.classList.toggle('is-keyword-active', index === next));
  }

  function update() {
    frame = 0;
    if (reduced.matches) return;
    const anchor = innerHeight * .36;
    const positions = principles.map((principle) => principle.querySelector('h3').getBoundingClientRect().top);
    const jumping = Math.abs(scrollY - lastY) > innerHeight * .7;
    const direction = Math.sign(scrollY - lastY);
    lastY = scrollY;
    let next = active < 0 ? 0 : active;
    if (jumping || active < 0) {
      next = 0;
      positions.forEach((top, index) => { if (top <= anchor) next = index; });
    } else if (direction >= 0) {
      while (next < principles.length - 1 && positions[next + 1] <= anchor) next++;
    } else {
      // Keep the current emphasis through small reverse wheel movements.
      while (next > 0 && positions[next] > anchor + innerHeight * .08) next--;
    }
    select(next);
  }
  function queueUpdate() { if (!frame) frame = requestAnimationFrame(update); }
  function configure() {
    active = -1;
    section.classList.toggle('is-reading-focused', !reduced.matches);
    principles.forEach((principle) => {
      principle.classList.add('is-revealed');
      principle.classList.remove('is-keyword-active');
    });
    update();
  }
  addEventListener('scroll', queueUpdate, { passive: true });
  addEventListener('resize', () => { active = -1; queueUpdate(); });
  reduced.addEventListener('change', configure);
  configure();
}
