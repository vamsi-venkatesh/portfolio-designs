// physics.js — a small 2D rigid-body engine written for the toybox.
// Convex polygons + circles. SAT with reference-face clipping (up to two contact points),
// sequential impulses with warm starting, Coulomb friction, restitution, Baumgarte bias,
// soft mouse joints (Box2D-style) and island sleeping for calm, stable stacks.

export class Body {
  static nextId = 1;
  constructor(o) {
    this.id = Body.nextId++;
    this.x = o.x || 0; this.y = o.y || 0; this.a = o.a || 0;
    this.vx = 0; this.vy = 0; this.w = 0;
    this.friction = o.friction ?? 0.6;
    this.restitution = o.restitution ?? 0.2;
    this.isStatic = !!o.isStatic;
    this.ceiling = !!o.ceiling;
    this.sleeping = false; this.sleepT = 0;
    this.active = o.active ?? true;
    this.entered = false;
    this.dragged = 0;
    this.data = o.data || null;
    const density = o.density ?? 1;
    const sh = o.shape;
    if (sh.type === 'circle') {
      this.type = 'circle'; this.r = sh.r;
      const m = density * Math.PI * sh.r * sh.r;
      this.mass = m; this.inertia = 0.5 * m * sh.r * sh.r;
      this.boundR = sh.r;
      this.minX = -sh.r; this.maxX = sh.r; this.minY = -sh.r; this.maxY = sh.r;
    } else {
      this.type = 'poly';
      const v = sh.verts;
      let area = 0, cx = 0, cy = 0, I = 0;
      for (let i = 0; i < v.length; i++) {
        const [x1, y1] = v[i], [x2, y2] = v[(i + 1) % v.length];
        const cr = x1 * y2 - x2 * y1;
        area += cr / 2;
        cx += cr * (x1 + x2) / 6;
        cy += cr * (y1 + y2) / 6;
        I += cr * (x1 * x1 + x1 * x2 + x2 * x2 + y1 * y1 + y1 * y2 + y2 * y2) / 12;
      }
      cx /= area; cy /= area;
      const m = density * Math.abs(area);
      this.mass = m;
      this.inertia = density * Math.abs(I) - m * (cx * cx + cy * cy);
      this.lv = v.map(([x, y]) => [x - cx, y - cy]);
      const n = this.lv.length;
      this.ln = [];
      let br = 0;
      this.minX = this.minY = Infinity; this.maxX = this.maxY = -Infinity;
      for (let i = 0; i < n; i++) {
        const [ax, ay] = this.lv[i], [bx, by] = this.lv[(i + 1) % n];
        let nx = by - ay, ny = -(bx - ax);
        const l = Math.hypot(nx, ny); nx /= l; ny /= l;
        if (nx * (ax + bx) / 2 + ny * (ay + by) / 2 < 0) { nx = -nx; ny = -ny; }
        this.ln.push([nx, ny]);
        br = Math.max(br, Math.hypot(ax, ay));
        this.minX = Math.min(this.minX, ax); this.maxX = Math.max(this.maxX, ax);
        this.minY = Math.min(this.minY, ay); this.maxY = Math.max(this.maxY, ay);
      }
      this.boundR = br;
      this.wv = new Float64Array(n * 2);
      this.wn = new Float64Array(n * 2);
    }
    if (this.isStatic) { this.invM = 0; this.invI = 0; }
    else { this.invM = 1 / this.mass; this.invI = 1 / this.inertia; }
    this.updateWorld();
  }
  updateWorld() {
    if (this.type !== 'poly') return;
    const c = Math.cos(this.a), s = Math.sin(this.a);
    const lv = this.lv, ln = this.ln, wv = this.wv, wn = this.wn;
    for (let i = 0; i < lv.length; i++) {
      const [x, y] = lv[i];
      wv[2 * i] = this.x + c * x - s * y;
      wv[2 * i + 1] = this.y + s * x + c * y;
      const [nx, ny] = ln[i];
      wn[2 * i] = c * nx - s * ny;
      wn[2 * i + 1] = s * nx + c * ny;
    }
  }
  contains(px, py) {
    if (this.type === 'circle') return (px - this.x) ** 2 + (py - this.y) ** 2 <= this.r * this.r;
    const n = this.lv.length;
    for (let i = 0; i < n; i++) {
      if (this.wn[2 * i] * (px - this.wv[2 * i]) + this.wn[2 * i + 1] * (py - this.wv[2 * i + 1]) > 0) return false;
    }
    return true;
  }
  wake() { if (this.sleeping) { this.sleeping = false; this.sleepT = 0; } }
  get dynamic() { return !this.isStatic; }
}

// ---------- narrow phase ----------
// contacts are speculative: pairs closer than MARGIN produce a contact with negative depth, so a fast
// body is stopped exactly at the surface instead of tunnelling in and being shoved back out.
const MARGIN = 16;
function maxSep(A, B) {
  let best = -Infinity, bi = 0;
  const an = A.wn, av = A.wv, bv = B.wv, na = A.lv.length, nb = B.lv.length;
  for (let i = 0; i < na; i++) {
    const nx = an[2 * i], ny = an[2 * i + 1], vx = av[2 * i], vy = av[2 * i + 1];
    let mn = Infinity;
    for (let j = 0; j < nb; j++) {
      const d = nx * (bv[2 * j] - vx) + ny * (bv[2 * j + 1] - vy);
      if (d < mn) mn = d;
    }
    if (mn > best) { best = mn; bi = i; }
  }
  return [best, bi];
}

function clip(p, nx, ny, o) {
  const d0 = nx * p[0] + ny * p[1] - o, d1 = nx * p[2] + ny * p[3] - o;
  const out = [];
  if (d0 <= 0) out.push(p[0], p[1]);
  if (d1 <= 0) out.push(p[2], p[3]);
  if (d0 * d1 < 0) {
    const t = d0 / (d0 - d1);
    out.push(p[0] + t * (p[2] - p[0]), p[1] + t * (p[3] - p[1]));
  }
  return out.length >= 4 ? out : null;
}

function polyPoly(A, B, out) {
  const [sa, ia] = maxSep(A, B); if (sa > MARGIN) return;
  const [sb, ib] = maxSep(B, A); if (sb > MARGIN) return;
  let ref, inc, edge, flip;
  if (sb > sa + 0.1 * Math.abs(sa) + 0.05) { ref = B; inc = A; edge = ib; flip = true; }
  else { ref = A; inc = B; edge = ia; flip = false; }
  const rn = ref.lv.length;
  const nx = ref.wn[2 * edge], ny = ref.wn[2 * edge + 1];
  const e2 = (edge + 1) % rn;
  const v1x = ref.wv[2 * edge], v1y = ref.wv[2 * edge + 1], v2x = ref.wv[2 * e2], v2y = ref.wv[2 * e2 + 1];
  let mi = 0, md = Infinity;
  const inN = inc.lv.length;
  for (let i = 0; i < inN; i++) {
    const d = nx * inc.wn[2 * i] + ny * inc.wn[2 * i + 1];
    if (d < md) { md = d; mi = i; }
  }
  const i2 = (mi + 1) % inN;
  let p = [inc.wv[2 * mi], inc.wv[2 * mi + 1], inc.wv[2 * i2], inc.wv[2 * i2 + 1]];
  let tx = v2x - v1x, ty = v2y - v1y;
  const tl = Math.hypot(tx, ty); tx /= tl; ty /= tl;
  p = clip(p, -tx, -ty, -(tx * v1x + ty * v1y)); if (!p) return;
  p = clip(p, tx, ty, tx * v2x + ty * v2y); if (!p) return;
  for (let k = 0; k < 2; k++) {
    const px = p[2 * k], py = p[2 * k + 1];
    const sep = nx * (px - v1x) + ny * (py - v1y);
    if (sep <= MARGIN) {
      out.push({ a: A, b: B, nx: flip ? -nx : nx, ny: flip ? -ny : ny,
        px: px - nx * sep * 0.5, py: py - ny * sep * 0.5, depth: -sep });
    }
  }
}

// normal points from poly P toward circle C
function polyCircle(P, C, out, swap) {
  const n = P.lv.length;
  let best = -Infinity, bi = 0;
  for (let i = 0; i < n; i++) {
    const s = P.wn[2 * i] * (C.x - P.wv[2 * i]) + P.wn[2 * i + 1] * (C.y - P.wv[2 * i + 1]);
    if (s > C.r + MARGIN) return;
    if (s > best) { best = s; bi = i; }
  }
  let nx, ny, depth, px, py;
  const j = (bi + 1) % n;
  const v1x = P.wv[2 * bi], v1y = P.wv[2 * bi + 1], v2x = P.wv[2 * j], v2y = P.wv[2 * j + 1];
  if (best < 1e-6) {
    nx = P.wn[2 * bi]; ny = P.wn[2 * bi + 1]; depth = C.r - best;
  } else {
    const u1 = (C.x - v1x) * (v2x - v1x) + (C.y - v1y) * (v2y - v1y);
    const u2 = (C.x - v2x) * (v1x - v2x) + (C.y - v2y) * (v1y - v2y);
    if (u1 <= 0 || u2 <= 0) {
      const vx = u1 <= 0 ? v1x : v2x, vy = u1 <= 0 ? v1y : v2y;
      const dx = C.x - vx, dy = C.y - vy, d = Math.hypot(dx, dy);
      if (d > C.r + MARGIN) return;
      nx = dx / d; ny = dy / d; depth = C.r - d;
    } else {
      nx = P.wn[2 * bi]; ny = P.wn[2 * bi + 1]; depth = C.r - best;
    }
  }
  px = C.x - nx * (C.r - depth * 0.5); py = C.y - ny * (C.r - depth * 0.5);
  if (swap) out.push({ a: C, b: P, nx: -nx, ny: -ny, px, py, depth });
  else out.push({ a: P, b: C, nx, ny, px, py, depth });
}

function circleCircle(A, B, out) {
  const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy), r = A.r + B.r;
  if (d > r + MARGIN) return;
  const nx = d > 1e-6 ? dx / d : 0, ny = d > 1e-6 ? dy / d : 1;
  const depth = r - d;
  out.push({ a: A, b: B, nx, ny, px: A.x + nx * (A.r - depth * 0.5), py: A.y + ny * (A.r - depth * 0.5), depth });
}

function collide(A, B, out) {
  if (A.type === 'poly' && B.type === 'poly') polyPoly(A, B, out);
  else if (A.type === 'poly') polyCircle(A, B, out, false);
  else if (B.type === 'poly') polyCircle(B, A, out, true);
  else circleCircle(A, B, out);
}

// ---------- world ----------
export class World {
  constructor() {
    this.bodies = [];
    this.joints = [];
    this.gx = 0; this.gy = 2600;
    this.iterations = 10;
    this.prev = new Map();
    this.contacts = [];
    this.onImpact = null;
    this.maxV = 2800;
  }
  add(b) { this.bodies.push(b); return b; }
  wakeAll() { for (const b of this.bodies) b.wake(); }

  step(dt) {
    const bodies = this.bodies;
    const g = { x: this.gx, y: this.gy };
    // 1. forces
    for (const b of bodies) {
      if (b.isStatic || !b.active || b.sleeping) continue;
      b.vx += g.x * dt; b.vy += g.y * dt;
      const ld = b.type === 'circle' ? 0.9992 : 0.9996;
      b.vx *= ld; b.vy *= ld; b.w *= 0.997;
      if (!b.entered && b.y - b.boundR > 2) b.entered = true;
    }
    // 2. contacts
    const contacts = [];
    const pairMap = new Map();
    const n = bodies.length;
    for (let i = 0; i < n; i++) {
      const A = bodies[i]; if (!A.active) continue;
      for (let j = i + 1; j < n; j++) {
        const B = bodies[j]; if (!B.active) continue;
        const aStill = A.isStatic || A.sleeping, bStill = B.isStatic || B.sleeping;
        if (aStill && bStill) continue;
        if ((A.ceiling && !B.entered) || (B.ceiling && !A.entered)) continue;
        if (this.filter && !this.filter(A, B)) continue;
        if (!A.isStatic && !B.isStatic) {
          const dx = A.x - B.x, dy = A.y - B.y, rr = A.boundR + B.boundR + MARGIN;
          if (dx * dx + dy * dy > rr * rr) continue;
        }
        const out = [];
        collide(A, B, out);
        if (!out.length) continue;
        const key = A.id * 100000 + B.id;
        const old = this.prev.get(key);
        for (const c of out) {
          c.Pn = 0; c.Pt = 0; c.fresh = true;
          if (old) {
            for (const o of old) {
              if ((o.px - c.px) ** 2 + (o.py - c.py) ** 2 < 16) { c.Pn = o.Pn; c.Pt = o.Pt; c.fresh = false; break; }
            }
          }
          contacts.push(c);
        }
        pairMap.set(key, out);
      }
    }
    // 3. wake sleepers touched by moving bodies
    for (const c of contacts) {
      const A = c.a, B = c.b;
      if (A.sleeping && !B.isStatic && !B.sleeping) {
        if (B.dragged || B.vx * B.vx + B.vy * B.vy > 225 || Math.abs(B.w) > 0.3) A.wake();
      } else if (B.sleeping && !A.isStatic && !A.sleeping) {
        if (A.dragged || A.vx * A.vx + A.vy * A.vy > 225 || Math.abs(A.w) > 0.3) B.wake();
      }
    }
    for (const b of bodies) {
      const still = b.isStatic || b.sleeping;
      b._im = still ? 0 : b.invM; b._iI = still ? 0 : b.invI;
    }
    // 4. prestep
    const inv = 1 / dt;
    for (const c of contacts) {
      const A = c.a, B = c.b;
      c.rax = c.px - A.x; c.ray = c.py - A.y; c.rbx = c.px - B.x; c.rby = c.py - B.y;
      const rnA = c.rax * c.ny - c.ray * c.nx, rnB = c.rbx * c.ny - c.rby * c.nx;
      const kn = A._im + B._im + A._iI * rnA * rnA + B._iI * rnB * rnB;
      c.mn = kn > 0 ? 1 / kn : 0;
      const tx = c.ny, ty = -c.nx;
      const rtA = c.rax * ty - c.ray * tx, rtB = c.rbx * ty - c.rby * tx;
      const kt = A._im + B._im + A._iI * rtA * rtA + B._iI * rtB * rtB;
      c.mt = kt > 0 ? 1 / kt : 0;
      c.fr = Math.sqrt(A.friction * B.friction);
      const sep = -c.depth;
      let bias = sep > 0 ? -sep * inv : Math.min(0.2 * inv * Math.max(0, c.depth - 0.4), 300);
      const dvx = B.vx - B.w * c.rby - A.vx + A.w * c.ray;
      const dvy = B.vy + B.w * c.rbx - A.vy - A.w * c.rax;
      const vn = dvx * c.nx + dvy * c.ny;
      const hits = sep + vn * dt < 0;
      const e = Math.max(A.restitution, B.restitution);
      if (vn < -140 && hits) bias = Math.max(bias, -e * vn);
      c.bias = bias;
      if (hits && vn < -260 && this.onImpact) this.onImpact(A, B, -vn, c);
      // warm start
      const Px = c.Pn * c.nx + c.Pt * tx, Py = c.Pn * c.ny + c.Pt * ty;
      A.vx -= A._im * Px; A.vy -= A._im * Py; A.w -= A._iI * (c.rax * Py - c.ray * Px);
      B.vx += B._im * Px; B.vy += B._im * Py; B.w += B._iI * (c.rbx * Py - c.rby * Px);
    }
    for (const j of this.joints) this.prepJoint(j, dt);
    // 5. iterate
    for (let it = 0; it < this.iterations; it++) {
      for (const j of this.joints) this.solveJoint(j);
      for (const c of contacts) {
        const A = c.a, B = c.b;
        let dvx = B.vx - B.w * c.rby - A.vx + A.w * c.ray;
        let dvy = B.vy + B.w * c.rbx - A.vy - A.w * c.rax;
        const vn = dvx * c.nx + dvy * c.ny;
        let dPn = c.mn * (-vn + c.bias);
        const Pn0 = c.Pn; c.Pn = Math.max(Pn0 + dPn, 0); dPn = c.Pn - Pn0;
        let Px = dPn * c.nx, Py = dPn * c.ny;
        A.vx -= A._im * Px; A.vy -= A._im * Py; A.w -= A._iI * (c.rax * Py - c.ray * Px);
        B.vx += B._im * Px; B.vy += B._im * Py; B.w += B._iI * (c.rbx * Py - c.rby * Px);
        // friction
        const tx = c.ny, ty = -c.nx;
        dvx = B.vx - B.w * c.rby - A.vx + A.w * c.ray;
        dvy = B.vy + B.w * c.rbx - A.vy - A.w * c.rax;
        const vt = dvx * tx + dvy * ty;
        let dPt = c.mt * -vt;
        const maxPt = c.fr * c.Pn;
        const Pt0 = c.Pt; c.Pt = Math.max(-maxPt, Math.min(maxPt, Pt0 + dPt)); dPt = c.Pt - Pt0;
        Px = dPt * tx; Py = dPt * ty;
        A.vx -= A._im * Px; A.vy -= A._im * Py; A.w -= A._iI * (c.rax * Py - c.ray * Px);
        B.vx += B._im * Px; B.vy += B._im * Py; B.w += B._iI * (c.rbx * Py - c.rby * Px);
      }
    }
    // 6. integrate
    const mv = this.maxV;
    for (const b of bodies) {
      if (b.isStatic || !b.active || b.sleeping) continue;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > mv) { b.vx *= mv / sp; b.vy *= mv / sp; }
      if (b.w > 40) b.w = 40; else if (b.w < -40) b.w = -40;
      b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.w * dt;
      b.updateWorld();
    }
    // 7. island sleeping
    const parent = new Map();
    const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
    for (const b of bodies) {
      if (b.isStatic || !b.active || b.sleeping) continue;
      parent.set(b, b);
      if (!b.dragged && b.vx * b.vx + b.vy * b.vy < 64 && b.w * b.w < 0.03) b.sleepT += dt; else b.sleepT = 0;
    }
    for (const c of contacts) {
      if (parent.has(c.a) && parent.has(c.b)) {
        const ra = find(c.a), rb = find(c.b);
        if (ra !== rb) parent.set(ra, rb);
      }
    }
    const minT = new Map();
    for (const b of parent.keys()) {
      const r = find(b);
      minT.set(r, Math.min(minT.has(r) ? minT.get(r) : Infinity, b.sleepT));
    }
    for (const b of parent.keys()) {
      if (minT.get(find(b)) >= 0.45) { b.sleeping = true; b.vx = b.vy = b.w = 0; }
    }
    this.prev = pairMap;
    this.contacts = contacts;
  }

  // soft mouse joint
  addJoint(body, wx, wy) {
    const dx = wx - body.x, dy = wy - body.y, c = Math.cos(-body.a), s = Math.sin(-body.a);
    const j = { body, lx: c * dx - s * dy, ly: s * dx + c * dy, tx: wx, ty: wy, ax: 0, ay: 0 };
    body.dragged++; body.wake();
    this.joints.push(j);
    return j;
  }
  removeJoint(j) {
    const i = this.joints.indexOf(j);
    if (i >= 0) this.joints.splice(i, 1);
    j.body.dragged = Math.max(0, j.body.dragged - 1);
  }
  prepJoint(j, dt) {
    const b = j.body; b.wake();
    const m = b.mass, omega = 2 * Math.PI * 6, zeta = 0.75;
    const d = 2 * m * zeta * omega, k = m * omega * omega;
    let gamma = dt * (d + dt * k); gamma = gamma > 0 ? 1 / gamma : 0;
    const beta = dt * k * gamma;
    const c = Math.cos(b.a), s = Math.sin(b.a);
    const rx = c * j.lx - s * j.ly, ry = s * j.lx + c * j.ly;
    j.rx = rx; j.ry = ry;
    const im = b.invM, iI = b.invI;
    const k11 = im + iI * ry * ry + gamma, k12 = -iI * rx * ry, k22 = im + iI * rx * rx + gamma;
    const det = k11 * k22 - k12 * k12;
    j.m11 = k22 / det; j.m12 = -k12 / det; j.m22 = k11 / det;
    j.cx = (b.x + rx - j.tx) * beta; j.cy = (b.y + ry - j.ty) * beta;
    j.gamma = gamma; j.maxI = m * 42000 * dt;
    j.ax = 0; j.ay = 0;
    b.w *= 0.985;
  }
  solveJoint(j) {
    const b = j.body;
    const cdx = b.vx - b.w * j.ry, cdy = b.vy + b.w * j.rx;
    const rx = -(cdx + j.cx + j.gamma * j.ax), ry = -(cdy + j.cy + j.gamma * j.ay);
    let ix = j.m11 * rx + j.m12 * ry, iy = j.m12 * rx + j.m22 * ry;
    const ox = j.ax, oy = j.ay;
    j.ax += ix; j.ay += iy;
    const l = Math.hypot(j.ax, j.ay);
    if (l > j.maxI) { j.ax *= j.maxI / l; j.ay *= j.maxI / l; }
    ix = j.ax - ox; iy = j.ay - oy;
    b.vx += b.invM * ix; b.vy += b.invM * iy;
    b.w += b.invI * (j.rx * iy - j.ry * ix);
  }
}
