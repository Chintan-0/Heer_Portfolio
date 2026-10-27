import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
const $$ = <T extends HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];

/* ---------- project pictures, drawn in code ---------- */
function gauss() { return Math.sqrt(-2 * Math.log(Math.random() || 1e-6)) * Math.cos(2 * Math.PI * Math.random()); }

const store = `<div class="v v-store" aria-hidden="true">
  <div class="top"><span>Catalog</span><i>Cart 2</i></div>
  <div class="shelf"><div class="bk">Atlas of Rivers</div><div class="bk">The Quiet Compiler</div><div class="bk">Small Systems</div><div class="bk">Field Notes</div></div>
</div>`;

const parse = `<div class="v v-parse" aria-hidden="true">
  <div class="doc"><i class="h"></i><i></i><i style="width:90%"></i><i style="width:74%"></i><i></i><i style="width:60%"></i><i style="width:84%"></i><i style="width:42%"></i><i style="width:70%"></i></div>
  <pre>POST /api/parse
{
  "skills": [
    <b>"Python"</b>,
    <b>"FastAPI"</b>,
    <b>"NLP"</b>
  ],
  "match": 0.82
}</pre>
</div>`;

function scatter(): string {
  const cl = [{ x: 90, y: 128, s: 13, c: '#0d0d0f' }, { x: 170, y: 68, s: 15, c: '#2b59ff' }, { x: 252, y: 118, s: 12, c: '#8a8a90' }];
  let s = '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="320" height="180" fill="#ebebe7"/>';
  cl.forEach((c) => { for (let i = 0; i < 34; i++) s += `<circle class="dot" cx="${(c.x + gauss() * c.s).toFixed(1)}" cy="${(c.y + gauss() * c.s * 0.8).toFixed(1)}" r="3.4" fill="${c.c}"/>`; });
  cl.forEach((c) => { s += `<circle cx="${c.x}" cy="${c.y}" r="6" fill="#ebebe7" stroke="${c.c}" stroke-width="2.5"/>`; });
  return s + '<text x="18" y="26" font-family="Inter Tight, sans-serif" font-size="9" font-weight="600" fill="#0d0d0f">k = 3 · scaled spend vs. frequency</text></svg>';
}

function fire(): string {
  const tones = ['#c6c6c0', '#d2d2cc', '#bcbcb6', '#dcdcd6', '#b0b0aa'];
  let s = '<svg viewBox="0 0 180 120" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
  for (let y = 0; y < 12; y++) for (let x = 0; x < 18; x++) {
    const d = Math.hypot(x - 11.5, y - 6);
    let f: string;
    if (d < 1.7) f = '#c2410c';
    else if (d < 3.1) f = Math.random() > 0.35 ? '#ea580c' : '#f59e5b';
    else if (d < 4.4) f = Math.random() > 0.6 ? '#ecd0b8' : tones[Math.floor(Math.random() * 5)];
    else f = tones[Math.floor(Math.random() * 5)];
    s += `<rect x="${x * 10}" y="${y * 10}" width="10" height="10" fill="${f}"/>`;
  }
  return s + '</svg>';
}
const fireHtml = `<div class="v v-fire" aria-hidden="true">${fire()}<div class="row"><span>fire</span><span>0.97</span></div><div class="meter"><i></i></div></div>`;

$$('[data-vis]').forEach((el) => {
  const k = el.dataset.vis;
  el.innerHTML = k === 'store' ? store : k === 'parse' ? parse : k === 'scatter' ? `<div class="v v-scatter">${scatter()}</div>` : fireHtml;
});

/* ---------- smooth scroll ---------- */
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    const t = id === '#top' ? 0 : document.querySelector(id);
    if (t === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t as number | HTMLElement, { offset: 0, duration: 1.4 });
    else (t === 0 ? window.scrollTo({ top: 0 }) : (t as HTMLElement).scrollIntoView());
  });
});

/* header: hides on the way down, returns on the way up */
const bar = $('#bar');
let lastY = 0;
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: (self) => {
    const y = self.scroll();
    bar.classList.toggle('solid', y > 40);
    bar.classList.toggle('hide', y > lastY && y > 300);
    lastY = y;
  },
});

/* ---------- words ---------- */
function splitWords(el: HTMLElement, mask: boolean): HTMLElement[] {
  const text = el.textContent ?? '';
  el.setAttribute('aria-label', text);
  el.innerHTML = text.split(/\s+/).map((w) => mask
    ? `<span class="w" aria-hidden="true"><span>${w}</span></span>`
    : `<span class="sw" aria-hidden="true">${w}</span>`).join(' ');
  return $$(mask ? '.w > span' : '.sw', el);
}

if (!reduce) {
  /* hero entrance */
  const hw = splitWords($('.hero h1'), true);
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(hw, { yPercent: 115, duration: 1.4, stagger: 0.12 })
    .from('.hero-copy > *', { y: 28, opacity: 0, duration: 1, stagger: 0.1 }, '-=0.9')
    .from('.arch', { y: 60, opacity: 0, duration: 1.3 }, '-=1.2');
  gsap.to('.arch img', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero h1', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* statement lights up word by word */
  const sw = splitWords($('#statement'), false);
  gsap.to(sw, { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: '#statement', start: 'top 82%', end: 'bottom 55%', scrub: true } });

  /* contact headline */
  const cw = splitWords($('.contact .big'), true);
  gsap.from(cw, { yPercent: 115, duration: 1.3, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.contact', start: 'top 60%' } });
  gsap.from(['.mail', '.c-links'], { y: 30, opacity: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.mail', start: 'top 92%' } });

  /* generic reveals */
  $$('[data-r]').forEach((el) => {
    gsap.from(el, { y: 44, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* stats count up */
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count!);
    const dec = parseInt(el.dataset.dec ?? '0', 10);
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 1.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = dec ? o.v.toFixed(dec) : String(Math.round(o.v)); },
    });
    el.textContent = dec ? (0).toFixed(dec) : '0';
  });

  /* timeline line draws as you scroll */
  gsap.to('#line', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#tl', start: 'top 70%', end: 'bottom 70%', scrub: true } });

  /* project pictures react as their card arrives */
  gsap.from('.v-scatter .dot', { scale: 0, transformOrigin: 'center', transformBox: 'fill-box' as string, duration: 1, stagger: 0.012, ease: 'back.out(2)', scrollTrigger: { trigger: '#work', start: 'top 60%', once: true } });
  gsap.from('.v-fire .meter i', { scaleX: 0, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: '#work', start: 'top 40%', once: true } });

  /* work: horizontal story, pinned */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const rail = $('#rail');
    const dist = () => rail.scrollWidth - window.innerWidth + 0;
    const cur = $('#cur');
    const fill = $('#bar2');
    gsap.to(rail, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '#workPin', pin: true, scrub: 0.6, start: 'top top', end: () => '+=' + dist() * 1.1, invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(fill, { scaleX: 0.25 + self.progress * 0.75 });
          cur.textContent = String(Math.min(4, Math.floor(self.progress * 3.999) + 1));
        },
      },
    });
  });
  mm.add('(max-width: 900px)', () => {
    $$('.card').forEach((c) => gsap.from(c, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 88%', once: true } }));
  });

  /* role words swap */
  const roles = ['backend APIs', 'full-stack features', 'AI prototypes'];
  const swap = $('#swap');
  let ri = 0;
  window.setInterval(() => {
    ri = (ri + 1) % roles.length;
    gsap.to(swap, { yPercent: -60, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => {
      swap.textContent = roles[ri];
      gsap.fromTo(swap, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
    } });
  }, 2600);

  /* cursor and magnetic buttons (fine pointers only) */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cur = $('.cursor');
    const qx = gsap.quickTo(cur, 'x', { duration: 0.25, ease: 'power3' });
    const qy = gsap.quickTo(cur, 'y', { duration: 0.25, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { cur.classList.add('on'); qx(e.clientX); qy(e.clientY); });
    document.addEventListener('pointerover', (e) => {
      const t = (e.target as HTMLElement).closest('a, button, .card, .g li');
      cur.classList.toggle('big', !!t);
    });
    $$('.mag').forEach((m) => {
      const x = gsap.quickTo(m, 'x', { duration: 0.5, ease: 'power3' });
      const y = gsap.quickTo(m, 'y', { duration: 0.5, ease: 'power3' });
      m.addEventListener('pointermove', (e) => {
        const r = m.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.3);
        y((e.clientY - (r.top + r.height / 2)) * 0.3);
      });
      m.addEventListener('pointerleave', () => { x(0); y(0); });
    });
  }
}
