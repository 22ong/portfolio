import './orbits.css';

// Both graphics use the same rotated ellipse and point; only scale and travel
// differ. SVG motion keeps the point on the actual visible path at every size.
function ellipsePath(cx, cy, rx, ry, angle = -28, start = 75) {
  const rotation = angle * Math.PI / 180;
  const beginning = start * Math.PI / 180;
  const k = 4 / 3 * Math.tan(Math.PI / 8);
  const point = (t) => [cx + Math.cos(rotation) * rx * Math.cos(t) - Math.sin(rotation) * ry * Math.sin(t), cy + Math.sin(rotation) * rx * Math.cos(t) + Math.cos(rotation) * ry * Math.sin(t)];
  const tangent = (t) => [-Math.cos(rotation) * rx * Math.sin(t) - Math.sin(rotation) * ry * Math.cos(t), -Math.sin(rotation) * rx * Math.sin(t) + Math.cos(rotation) * ry * Math.cos(t)];
  const coordinates = (p) => p.map((value) => value.toFixed(3)).join(' ');
  let d = `M ${coordinates(point(beginning))}`;
  for (let index = 0; index < 4; index++) {
    const from = beginning + index * Math.PI / 2;
    const to = from + Math.PI / 2;
    const a = point(from), b = point(to), ta = tangent(from), tb = tangent(to);
    d += ` C ${coordinates(a.map((value, i) => value + k * ta[i]))} ${coordinates(b.map((value, i) => value - k * tb[i]))} ${coordinates(b)}`;
  }
  return `${d} Z`;
}

export function renderOrbit(kind) {
  const hero = kind === 'hero';
  const path = hero ? ellipsePath(180, 150, 155, 66) : ellipsePath(980, 510, 790, 310);
  return `<svg class="orbit-svg orbit-svg-${kind}" data-orbit="${kind}" viewBox="0 0 ${hero ? '360 300' : '1440 1080'}" aria-hidden="true" focusable="false">
    <path id="${kind}-orbit-path" class="orbit-line" d="${path}"${hero ? ' pathLength="1"' : ''} />
    ${hero ? '' : `<path class="orbit-line orbit-line-secondary" d="${ellipsePath(1002, 535, 727, 273)}" />`}
    <g class="orbit-traveler"><circle class="orbit-point" r="${hero ? '3' : '8'}" /><animateMotion dur="${hero ? '110' : '72'}s" repeatCount="indefinite" rotate="0" calcMode="paced"><mpath href="#${kind}-orbit-path" /></animateMotion></g>
  </svg>`;
}

export function initOrbits() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const states = [...document.querySelectorAll('[data-orbit]')].map((svg) => ({ svg, section: svg.closest('.hero, .contact'), inView: false }));

  function sync(state) {
    const play = state.inView && !reduced.matches && !document.hidden;
    if (play) state.svg.unpauseAnimations?.();
    else state.svg.pauseAnimations?.();
    if (state.draw) {
      if (play) state.draw.play();
      else state.draw.pause();
    }
  }

  const contact = states.find((state) => state.svg.dataset.orbit === 'contact');
  function resizeContact() {
    const { width, height } = contact.svg.parentElement.getBoundingClientRect();
    if (!width || !height) return;
    const mobile = width <= 760;
    const cx = width * (mobile ? .57 : .68);
    const cy = height * .48;
    const rx = width * .55;
    const ry = height * .29;
    const angle = mobile ? -18 : -28;
    contact.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    contact.svg.querySelector('.orbit-line').setAttribute('d', ellipsePath(cx, cy, rx, ry, angle));
    contact.svg.querySelector('.orbit-line-secondary').setAttribute('d', ellipsePath(cx + width * .016, cy + height * .023, rx * .92, ry * .88, angle));
    contact.svg.querySelector('circle').setAttribute('r', mobile ? '5' : '8');
  }

  states.forEach((state) => { state.svg.pauseAnimations?.(); state.svg.setCurrentTime?.(0); });
  const hero = states.find((state) => state.svg.dataset.orbit === 'hero');
  if (!reduced.matches && hero.svg.querySelector('path').animate) {
    const draw = hero.svg.querySelector('path').animate([
      { strokeDasharray: '1', strokeDashoffset: 1 },
      { strokeDasharray: '1', strokeDashoffset: 0 },
    ], { duration: 3000, delay: 1500, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'both' });
    hero.draw = draw;
    draw.pause();
    draw.onfinish = () => { draw.cancel(); hero.draw = null; };
  }
  resizeContact();
  if ('ResizeObserver' in window) new ResizeObserver(resizeContact).observe(contact.svg.parentElement);
  else addEventListener('resize', resizeContact);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const state = states.find((item) => item.section === entry.target);
        state.inView = entry.isIntersecting && entry.intersectionRatio > .02;
        sync(state);
      }
    }, { threshold: [0, .02] });
    states.forEach((state) => observer.observe(state.section));
  } else states.forEach((state) => { state.inView = true; sync(state); });

  reduced.addEventListener('change', () => states.forEach((state) => {
    if (reduced.matches) { state.svg.pauseAnimations?.(); state.svg.setCurrentTime?.(0); }
    if (reduced.matches && state.draw) { state.draw.cancel(); state.draw = null; }
    sync(state);
  }));
  document.addEventListener('visibilitychange', () => states.forEach(sync));
}
