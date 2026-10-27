import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { nodes, byId, GraphNode } from './data';
import './style.css';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('scene') as HTMLCanvasElement;
const tagsEl = document.getElementById('tags') as HTMLDivElement;
const panel = document.getElementById('panel') as HTMLElement;
const hint = document.getElementById('hint') as HTMLElement;

/* ---------- renderer, camera, post ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03040a);
scene.fog = new THREE.FogExp2(0x06070b, 0.018);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
const HOME_POS = new THREE.Vector3(0, 4, 17);
const HOME_LOOK = new THREE.Vector3(0, 0, 0);
camera.position.copy(reduce ? HOME_POS : new THREE.Vector3(0, 14, 70));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4;
controls.maxDistance = 48;
controls.enablePan = false;
controls.autoRotate = !reduce;
controls.autoRotateSpeed = 0.45;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.45, 0.3);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---------- helpers ---------- */
function glowTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const glow = glowTexture();

function gauss(): number {
  return Math.sqrt(-2 * Math.log(Math.random() || 1e-6)) * Math.cos(2 * Math.PI * Math.random());
}

function pointCloud(count: number, spread: number, size: number, color: THREE.ColorRepresentation, opacity = 1): THREE.Points {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = gauss() * spread;
    pos[i * 3 + 1] = gauss() * spread;
    pos[i * 3 + 2] = gauss() * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size, color, map: glow, transparent: true, opacity, depthWrite: false,
    blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

/* ---------- starfield that reacts to the pointer ---------- */
const stars = new THREE.Group();
{
  const n = 2200;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 70 + Math.random() * 90;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pos[i * 3 + 2] = r * Math.cos(ph);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  stars.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.9, color: 0x8892b0, map: glow, transparent: true, opacity: 0.7, depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));
}
scene.add(stars);

/* ---------- nodes ---------- */
interface Live {
  node: GraphNode;
  group: THREE.Group;
  halo: THREE.Sprite;
  spin: THREE.Object3D[];
  hit: THREE.Mesh;
  tag: HTMLButtonElement;
  base: number;
  dim: boolean;
}
const live = new Map<string, Live>();
const hits: THREE.Object3D[] = [];

function wire(geo: THREE.BufferGeometry, color: string, opacity = 0.9): THREE.LineSegments {
  return new THREE.LineSegments(
    new THREE.WireframeGeometry(geo),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

function buildObject(n: GraphNode): { group: THREE.Group; spin: THREE.Object3D[]; radius: number } {
  const g = new THREE.Group();
  const spin: THREE.Object3D[] = [];
  let radius = 1.2;
  if (n.kind === 'core') {
    const a = wire(new THREE.IcosahedronGeometry(1.5, 1), n.color);
    const b = wire(new THREE.OctahedronGeometry(2.3, 0), '#ffffff', 0.35);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), new THREE.MeshBasicMaterial({ color: n.color }));
    g.add(a, b, core);
    spin.push(a, b);
    radius = 2.4;
  } else if (n.id === 'book') {
    for (let i = 0; i < 4; i++) {
      const w = 1.6 - i * 0.14;
      const box = wire(new THREE.BoxGeometry(w, 0.32, 1.1 - i * 0.05), n.color);
      box.position.y = -0.55 + i * 0.4;
      box.rotation.y = i * 0.28;
      g.add(box);
    }
    spin.push(g);
    radius = 1.4;
  } else if (n.id === 'insight') {
    const o = wire(new THREE.OctahedronGeometry(1.2, 0), n.color);
    const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), new THREE.MeshBasicMaterial({ color: n.color }));
    g.add(o, inner);
    spin.push(o, inner);
  } else if (n.id === 'segment') {
    const colors = ['#ffb347', '#ffe0a3', '#ff8a3d'];
    for (let i = 0; i < 3; i++) {
      const c = pointCloud(46, 0.34, 0.2, colors[i]);
      c.position.set(Math.cos(i * 2.1) * 0.95, Math.sin(i * 2.1) * 0.6, Math.sin(i * 1.3) * 0.7);
      g.add(c);
    }
    spin.push(g);
    radius = 1.6;
  } else if (n.id === 'fire') {
    const t = wire(new THREE.IcosahedronGeometry(1.25, 0), n.color);
    const t2 = wire(new THREE.IcosahedronGeometry(0.75, 0), '#ffffff', 0.6);
    g.add(t, t2);
    spin.push(t, t2);
  } else {
    const c = pointCloud(70, 0.85, 0.22, n.color);
    g.add(c);
    spin.push(c);
    radius = 1.5;
  }
  return { group: g, spin, radius };
}

nodes.forEach((n) => {
  const { group, spin, radius } = buildObject(n);
  group.position.set(...n.pos);
  const mat = new THREE.SpriteMaterial({
    map: glow, color: n.color, transparent: true, opacity: n.kind === 'skill' ? 0.16 : 0.26,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Sprite(mat);
  const hs = n.kind === 'core' ? 6 : n.kind === 'project' ? 3.6 : 4.4;
  halo.scale.setScalar(hs);
  group.add(halo);

  const hit = new THREE.Mesh(new THREE.SphereGeometry(radius + 0.4, 10, 10), new THREE.MeshBasicMaterial({ visible: false }));
  hit.userData.id = n.id;
  group.add(hit);
  hits.push(hit);
  scene.add(group);

  const tag = document.createElement('button');
  tag.type = 'button';
  tag.className = `tag ${n.kind}`;
  tag.style.setProperty('--c', n.color);
  tag.dataset.id = n.id;
  tag.innerHTML = `<i></i><span>${n.label}</span>`;
  tag.setAttribute('aria-label', `${n.label}: ${n.sub}`);
  tagsEl.appendChild(tag);

  live.set(n.id, { node: n, group, halo, spin, hit, tag, base: hs, dim: false });
});

/* ---------- edges with travelling packets ---------- */
interface Edge { a: GraphNode; b: GraphNode; line: THREE.Line; offset: number }
const edges: Edge[] = [];
nodes.forEach((n) => {
  n.links.forEach((id) => {
    const m = byId.get(id)!;
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...n.pos), new THREE.Vector3(...m.pos)]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: m.color, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(line);
    edges.push({ a: n, b: m, line, offset: Math.random() });
  });
});
const PACKETS = edges.length * 2;
const packetPos = new Float32Array(PACKETS * 3);
const packetGeo = new THREE.BufferGeometry();
packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
const packets = new THREE.Points(packetGeo, new THREE.PointsMaterial({
  size: 0.34, color: 0xffffff, map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
}));
packets.frustumCulled = false;
scene.add(packets);

/* ---------- state: selection, hover, fly ---------- */
let selected: string | null = null;
let hover: string | null = null;
let filter = 'all';
let fly: { pos: THREE.Vector3; look: THREE.Vector3; k: number } | null = null;
let idleTimer = 0;
const tmp = new THREE.Vector3();
const wide = () => window.innerWidth > 820;

function flyHome(k = 2.4) {
  fly = { pos: HOME_POS.clone(), look: HOME_LOOK.clone(), k };
  if (reduce) { camera.position.copy(HOME_POS); controls.target.copy(HOME_LOOK); fly = null; }
}

function flyTo(id: string) {
  const l = live.get(id)!;
  const p = l.group.position;
  const dist = l.node.kind === 'core' ? 9 : l.node.kind === 'project' ? 7.5 : 9;
  const dir = tmp.copy(camera.position).sub(p).normalize();
  const pos = p.clone().add(dir.clone().multiplyScalar(dist));
  const look = p.clone();
  if (wide()) {
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    look.add(right.multiplyScalar(dist * 0.28));
    pos.add(right.clone().multiplyScalar(dist * 0.28));
  }
  fly = { pos, look, k: 3 };
  if (reduce) { camera.position.copy(pos); controls.target.copy(look); fly = null; }
}

function showPanel(n: GraphNode) {
  (document.getElementById('p-title') as HTMLElement).textContent = n.label;
  (document.getElementById('p-kind') as HTMLElement).textContent = n.sub;
  (document.getElementById('p-desc') as HTMLElement).textContent = n.desc;
  const ul = document.getElementById('p-items') as HTMLElement;
  ul.innerHTML = '';
  n.items.forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
  const repo = document.getElementById('p-repo') as HTMLAnchorElement;
  if (n.repo) { repo.href = n.repo; repo.hidden = false; } else repo.hidden = true;
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('open'));
}

function select(id: string | null) {
  selected = id;
  live.forEach((l) => l.tag.classList.toggle('sel', l.node.id === id));
  if (id) {
    controls.autoRotate = false;
    showPanel(byId.get(id)!);
    flyTo(id);
    hint.textContent = 'Press Esc or the × to go back to the whole graph.';
  } else {
    panel.classList.remove('open');
    setTimeout(() => { if (!selected) panel.hidden = true; }, 350);
    flyHome();
    hint.textContent = 'Drag to orbit. Scroll to zoom. Click any node.';
    if (!reduce) setTimeout(() => { if (!selected) controls.autoRotate = true; }, 3000);
  }
}

/* ---------- input ---------- */
tagsEl.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest('.tag') as HTMLElement | null;
  if (t) select(t.dataset.id === selected ? null : t.dataset.id!);
});
tagsEl.addEventListener('pointerover', (e) => {
  const t = (e.target as HTMLElement).closest('.tag') as HTMLElement | null;
  hover = t ? t.dataset.id! : null;
});
tagsEl.addEventListener('pointerout', () => { hover = null; });
tagsEl.addEventListener('focusin', (e) => { hover = (e.target as HTMLElement).dataset.id ?? null; });
tagsEl.addEventListener('focusout', () => { hover = null; });
(document.getElementById('close') as HTMLElement).addEventListener('click', () => select(null));
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && selected) select(null); });

const dock = document.getElementById('dock') as HTMLElement;
dock.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button') as HTMLButtonElement | null;
  if (!b) return;
  filter = b.dataset.f!;
  dock.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  live.forEach((l) => {
    l.dim = filter !== 'all' && l.node.kind !== filter && l.node.kind !== 'core';
    l.tag.classList.toggle('dim', l.dim);
  });
});

// clicking a 3D object (not dragging)
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let down = { x: 0, y: 0 };
function pick(ev: PointerEvent): string | null {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const h = ray.intersectObjects(hits, false)[0];
  return h ? (h.object.userData.id as string) : null;
}
canvas.addEventListener('pointerdown', (e) => {
  down = { x: e.clientX, y: e.clientY };
  controls.autoRotate = false;
  fly = null;
  window.clearTimeout(idleTimer);
});
canvas.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 5) {
    const id = pick(e);
    if (id) { select(id); return; }
  }
  if (!selected && !reduce) idleTimer = window.setTimeout(() => { controls.autoRotate = true; }, 5000);
});
let mx = 0, my = 0;
canvas.addEventListener('pointermove', (e) => {
  mx = (e.clientX / window.innerWidth) * 2 - 1;
  my = (e.clientY / window.innerHeight) * 2 - 1;
  if (e.buttons === 0) {
    const id = pick(e);
    hover = id;
    canvas.style.cursor = id ? 'pointer' : 'grab';
  }
});

/* ---------- resize ---------- */
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  bloom.resolution.set(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const d = 17 * Math.max(1, Math.pow(1.7 / camera.aspect, 0.65));
  HOME_POS.set(0, d * 0.22, d);
}
window.addEventListener('resize', resize);
resize();

/* ---------- loop ---------- */
const clock = new THREE.Clock();
const v = new THREE.Vector3();
const a = new THREE.Vector3();
const b = new THREE.Vector3();

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (fly) {
    const k = 1 - Math.exp(-dt * fly.k);
    camera.position.lerp(fly.pos, k);
    controls.target.lerp(fly.look, k);
    if (camera.position.distanceTo(fly.pos) < 0.05 && controls.target.distanceTo(fly.look) < 0.05) fly = null;
  }
  controls.update();

  stars.rotation.y += dt * 0.01;
  stars.rotation.x += (my * 0.08 - stars.rotation.x) * 0.03;
  stars.rotation.z += (mx * 0.08 - stars.rotation.z) * 0.03;

  live.forEach((l) => {
    const active = l.node.id === selected || l.node.id === hover;
    l.spin.forEach((o, i) => { o.rotation.y += dt * (0.3 + i * 0.25) * (l.node.kind === 'skill' ? 0.4 : 1); if (l.node.kind !== 'skill') o.rotation.x += dt * 0.12 * (i % 2 ? -1 : 1); });
    const pulse = 1 + Math.sin(t * 2 + l.node.pos[0]) * 0.06;
    const target = (l.dim ? 0.55 : 1) * (active ? 1.25 : 1) * pulse;
    l.group.scale.lerp(v.setScalar(target), 0.12);
    l.halo.material.opacity += ((l.dim ? 0.04 : active ? 0.6 : l.node.kind === 'skill' ? 0.16 : 0.26) - l.halo.material.opacity) * 0.12;
  });

  edges.forEach((e, i) => {
    const active = selected && (e.a.id === selected || e.b.id === selected);
    const hov = hover && (e.a.id === hover || e.b.id === hover);
    const dimmed = selected && !active;
    const m = e.line.material as THREE.LineBasicMaterial;
    m.opacity += ((dimmed ? 0.05 : active || hov ? 0.85 : 0.22) - m.opacity) * 0.1;
    a.set(...e.a.pos); b.set(...e.b.pos);
    for (let p = 0; p < 2; p++) {
      const f = ((t * 0.18 + e.offset + p * 0.5) % 1);
      v.lerpVectors(a, b, f);
      const idx = (i * 2 + p) * 3;
      packetPos[idx] = v.x; packetPos[idx + 1] = v.y; packetPos[idx + 2] = v.z;
    }
  });
  packetGeo.attributes.position.needsUpdate = true;

  // tags follow their nodes
  const w = window.innerWidth, h = window.innerHeight;
  live.forEach((l) => {
    l.group.getWorldPosition(v);
    const d = camera.position.distanceTo(v);
    const lift = l.node.kind === 'core' ? 0 : 0;
    v.y += lift;
    v.project(camera);
    const x = (v.x * 0.5 + 0.5) * w;
    const y = (-v.y * 0.5 + 0.5) * h;
    const on = v.z < 1 && x > -60 && x < w + 60 && y > -40 && y < h + 40;
    l.tag.style.opacity = on ? String(Math.max(0.25, Math.min(1, 1.5 - d / 40)) * (l.dim ? 0.25 : 1)) : '0';
    l.tag.style.pointerEvents = on ? 'auto' : 'none';
    l.tag.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + 34 * Math.min(1, 14 / d) + 12).toFixed(1)}px, 0) translate(-50%, 0)`;
    l.tag.style.zIndex = String(Math.round(1000 - d));
  });

  composer.render();
  requestAnimationFrame(frame);
}

flyHome(0.9);
requestAnimationFrame(frame);
