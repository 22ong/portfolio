import './sections.css';
import { profile, about, contact } from './data.js';
import { renderOrbit } from './orbits.js';

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function channelAttributes(channel) {
  if (!channel?.href) return 'type="button" data-contact-placeholder aria-haspopup="dialog"';
  return `href="${escapeHTML(channel.href)}"${channel.href.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener noreferrer"'}`;
}

export function renderAboutAndContact() {
  const email = contact.channels.find((channel) => channel.id === 'email');
  const ctaTag = email?.href ? 'a' : 'button';
  return `
    <section class="about" id="about" aria-labelledby="about-heading">
      <div class="about-grid">
        <div class="about-statement">
          <p class="eyebrow about-section-label"><span class="section-number">03</span> ABOUT</p>
          <h2 id="about-heading">${about.statement.map(escapeHTML).join('<br>')}</h2>
          <p class="about-signature">Less noise. <em>More meaning.</em></p>
        </div>
        <div class="about-information">
          <div class="about-identity">
            <p class="about-profile-line"><span>${escapeHTML(profile.name)}</span><span>${escapeHTML(about.role)}</span></p>
            <p class="about-introduction">${escapeHTML(about.introduction)}</p>
          </div>
          <div class="about-principles">
            ${about.principles.map((principle, index) => `<article class="about-principle about-reveal"><p class="principle-index"><span>${String(index + 1).padStart(2, '0')}</span><span class="principle-note">${escapeHTML(principle.note)}</span></p><h3>${escapeHTML(principle.title)}</h3><p class="principle-description">${escapeHTML(principle.description)}</p></article>`).join('')}
          </div>
          <div class="about-tools about-reveal"><h3>TOOLS</h3><ul>${about.tools.map((tool) => `<li>${escapeHTML(tool)}</li>`).join('')}</ul></div>
        </div>
      </div>
    </section>
    <section class="contact" id="contact" aria-labelledby="contact-heading">
      <div class="contact-orbits" aria-hidden="true">${renderOrbit('contact')}</div>
      <div class="new-section-topline"><p class="eyebrow"><span class="section-number">04</span> LET'S WORK TOGETHER</p><span class="new-section-aside">A CONVERSATION STARTS HERE <span aria-hidden="true">↙</span></span></div>
      <div class="contact-invitation">
        <h2 id="contact-heading"><${ctaTag} class="contact-title-link" draggable="false" data-contact-cursor ${channelAttributes(email)}>LET'S MAKE<br>SOMETHING<br>MEMORABLE<span class="contact-period">.</span></${ctaTag}></h2>
        <p class="contact-description">${escapeHTML(contact.description)}</p>
        <${ctaTag} class="contact-email contact-cta" draggable="false" data-contact-cursor ${channelAttributes(email)}><span>${escapeHTML(email?.display ?? 'your@email.com')}</span><span class="contact-cta-arrow" aria-hidden="true">↗</span></${ctaTag}>
      </div>
      <div class="contact-bottom">
        <nav class="contact-socials" aria-label="소셜 채널">
          ${contact.channels.filter((channel) => channel.id !== 'email').map((channel) => {
            const tag = channel.href ? 'a' : 'button';
            return `<${tag} class="social-link" ${channelAttributes(channel)}><span>${escapeHTML(channel.label.toUpperCase())}</span><span class="social-arrow" aria-hidden="true">↗</span></${tag}>`;
          }).join('')}
        </nav>
        ${contact.channels.some((channel) => !channel.href) ? '<p class="contact-availability">연락처는 곧 업데이트됩니다.</p>' : ''}
      </div>
      <footer class="contact-footer"><span>© 2026 ${escapeHTML(profile.name)}</span><span>DESIGNED & DEVELOPED BY ${escapeHTML(profile.name)}</span><a href="#top">BACK TO TOP <span aria-hidden="true">↑</span></a></footer>
    </section>
    <div class="contact-cursor" aria-hidden="true"><div class="contact-cursor-disc"><span>CONTACT<br>ME</span><span class="contact-cursor-arrow">↗</span></div></div>
    <dialog class="contact-dialog" aria-labelledby="contact-dialog-heading"><button class="contact-dialog-close" type="button" aria-label="연락처 안내 닫기">×</button><p class="new-section-eyebrow">LET'S KEEP IN TOUCH</p><h2 id="contact-dialog-heading">곧, 여기서 만나요.</h2><p>연락 가능한 채널을 준비하고 있습니다.<br>조금만 기다려주세요.</p><button class="contact-dialog-continue" type="button">확인 <span aria-hidden="true">↗</span></button></dialog>
  `;
}

export function initSections() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const dialog = document.querySelector('.contact-dialog');
  document.querySelectorAll('[data-contact-placeholder]').forEach((button) => button.addEventListener('click', () => dialog.showModal()));
  dialog.querySelector('.contact-dialog-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.contact-dialog-continue').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  // Position and scale live on separate layers to preserve the original
  // pointer interpolation while the larger contact disc eases in and out.
  const targets = [...document.querySelectorAll('[data-contact-cursor]')];
  const cursor = document.querySelector('.contact-cursor');
  let inside = false;
  let frame = 0;
  let x = 0, y = 0, mouseX = 0, mouseY = 0;
  function follow() {
    const ease = reducedMotion.matches ? 1 : 0.18;
    x += (mouseX - x) * ease;
    y += (mouseY - y) * ease;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    if (inside) frame = requestAnimationFrame(follow);
  }
  function hide() {
    inside = false;
    cursor.classList.remove('is-visible');
    targets.forEach((target) => target.classList.remove('has-contact-cursor'));
    cancelAnimationFrame(frame);
  }
  function enter(event) {
    if (!finePointer.matches || event.pointerType === 'touch') return;
    hide();
    x = mouseX = event.clientX;
    y = mouseY = event.clientY;
    inside = true;
    cursor.classList.add('is-visible');
    event.currentTarget.classList.add('has-contact-cursor');
    follow();
  }
  targets.forEach((target) => {
    target.addEventListener('dragstart', (event) => event.preventDefault());
    target.addEventListener('pointerenter', enter);
    target.addEventListener('pointermove', (event) => {
      if (!inside) enter(event);
      mouseX = event.clientX;
      mouseY = event.clientY;
    });
    target.addEventListener('pointerleave', hide);
    target.addEventListener('pointercancel', hide);
    target.addEventListener('click', hide);
  });
  addEventListener('scroll', hide, { passive: true });
  addEventListener('blur', hide);
  finePointer.addEventListener('change', hide);
}
