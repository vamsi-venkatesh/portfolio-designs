// The Fold — crease patterns + a rigid folding engine.
// Every form is ONE flat sheet. Tree forms: each face hangs off a parent face by a hinge (a crease line in the
// flat sheet) and rotates about it; a face's pose is parent pose × rotation about the crease, so faces stay joined
// along their creases at every instant of the fold. Miura-ori is solved in closed form (rigid-foldable, 1 DOF).
import { Matrix4, Vector3, Quaternion } from '../../../vendor/three.module.js';

const D2R = Math.PI / 180;
export const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (t, w) => (w[1] <= w[0] ? (t >= w[1] ? 1 : 0) : Math.min(1, Math.max(0, (t - w[0]) / (w[1] - w[0]))));
const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
const ccw = (p) => (area(p) < 0 ? p.slice().reverse() : p);

// ---------- generic tree model ----------
// faces: [{ poly:[[u,v]...], parent:index|-1, hinge:[[u,v],[u,v]], A:deg (+valley / -mountain), w:[t0,t1] }]
function tree(name, faces, opt = {}) {
  faces = faces.map((f) => ({ ...f, poly: ccw(f.poly) }));
  const prep = faces.map((f) => {
    if (f.parent < 0) return null;
    const [a, b] = f.hinge;
    const cx = f.poly.reduce((s, p) => s + p[0], 0) / f.poly.length, cy = f.poly.reduce((s, p) => s + p[1], 0) / f.poly.length;
    const left = (b[0] - a[0]) * (cy - a[1]) - (b[1] - a[1]) * (cx - a[0]) > 0;
    const axis = new Vector3(b[0] - a[0], 0, -(b[1] - a[1])).normalize();
    return { a3: new Vector3(a[0], 0, -a[1]), axis, sgn: left ? 1 : -1 };
  });
  const mats = faces.map(() => new Matrix4());
  const R = new Matrix4(), T1 = new Matrix4(), T2 = new Matrix4(), root = new Matrix4();
  const qI = new Quaternion(), qT = opt.rootQ || null, q = new Quaternion();
  return {
    name, kind: 'tree',
    polys: faces.map((f) => f.poly),
    creases: faces.map((f, i) => (f.parent < 0 ? null : { a: f.hinge[0], b: f.hinge[1], type: f.A >= 0 ? 'v' : 'm', w0: f.w[0], face: i })).filter(Boolean),
    yaw: opt.yaw || 0,
    pose(t, o = {}, out) {
      const br = o.breath || 0, pulse = o.pulse || 0;
      root.identity();
      if (qT) { q.slerpQuaternions(qI, qT, ease(seg(t, opt.rootW || [0.5, 1]))); root.makeRotationFromQuaternion(q); }
      for (let i = 0; i < faces.length; i++) {
        const f = faces[i];
        if (f.parent < 0) { mats[i].copy(root); if (f.base) mats[i].multiply(f.base); }
        else {
          const p = prep[i];
          let ang = f.A * ease(seg(t, f.w)) * (1 - br) + (f.P || 0) * pulse;
          ang *= p.sgn * D2R;
          T1.makeTranslation(p.a3.x, p.a3.y, p.a3.z); R.makeRotationAxis(p.axis, ang); T2.makeTranslation(-p.a3.x, -p.a3.y, -p.a3.z);
          mats[i].copy(mats[f.parent]).multiply(T1).multiply(R).multiply(T2);
        }
        const P = out[i];
        for (let k = 0; k < f.poly.length; k++) P[k].set(f.poly[k][0], 0, -f.poly[k][1]).applyMatrix4(mats[i]);
      }
      return out;
    },
  };
}

// ---------- Miura-ori, closed form (Schenk & Guest parametrisation) ----------
function miura(name, nI, nJ, a, b, alphaDeg, thetaMax, opt = {}) {
  const al = alphaDeg * D2R;
  const geo = (th) => {
    const ct = Math.cos(th), st = Math.sin(th), ta = Math.tan(al), sa = Math.sin(al);
    const k = Math.sqrt(1 + ct * ct * ta * ta);
    return { H: a * st * sa, S: (b * ct * ta) / k, L: a * Math.sqrt(1 - st * st * sa * sa), V: b / k };
  };
  const vtx = (g, i, j) => [i * g.S, j * g.L + (i % 2 ? g.V : 0), j % 2 ? g.H : 0];
  const g0 = geo(0);
  const polys = [], ids = [];
  for (let i = 0; i < nI; i++) for (let j = 0; j < nJ; j++) {
    const q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
    let p = q.map(([x, y]) => { const v = vtx(g0, x, y); return [v[0], v[1]]; });
    const flip = area(p) < 0; if (flip) { p = p.reverse(); q.reverse(); }
    polys.push(p); ids.push(q);
  }
  const creases = [];
  for (let i = 1; i < nI; i++) for (let j = 0; j < nJ; j++) { const A = vtx(g0, i, j), B = vtx(g0, i, j + 1); creases.push({ a: [A[0], A[1]], b: [B[0], B[1]], type: i % 2 ? 'm' : 'v', w0: 0 }); }
  for (let j = 1; j < nJ; j++) for (let i = 0; i < nI; i++) { const A = vtx(g0, i, j), B = vtx(g0, i + 1, j); creases.push({ a: [A[0], A[1]], b: [B[0], B[1]], type: j % 2 ? 'v' : 'm', w0: 0 }); }
  return {
    name, kind: 'miura', polys, creases, yaw: opt.yaw || 0,
    pose(t, o = {}, out) {
      const th = thetaMax * ease(t) * (1 - (o.breath || 0) * 1.5);
      const g = geo(th);
      for (let f = 0; f < ids.length; f++) {
        const q = ids[f];
        for (let k = 0; k < 4; k++) { const v = vtx(g, q[k][0], q[k][1]); out[f][k].set(v[0], v[2], -v[1]); }
      }
      return out;
    },
  };
}

// ---------- the forms ----------
const rect = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
const qAxis = (x, y, z, deg) => new Quaternion().setFromAxisAngle(new Vector3(x, y, z).normalize(), deg * D2R);

// VV — a strip folded flat along three horizontal creases; each fold reflects the strip into the next stroke.
function vv() {
  const h = 1.4, w = 0.3, ta = Math.tan(19 * D2R), c20 = Math.cos(19 * D2R), s20 = Math.sin(19 * D2R);
  const ox = c20 * w / 2, oy = s20 * w / 2;
  const L = (Y) => [-(Y + oy) * ta - ox, Y], Rr = (Y) => [-(Y - oy) * ta + ox, Y];
  const faces = [];
  for (let k = 0; k < 4; k++) {
    const Y0 = -k * h, Y1 = -(k + 1) * h;
    faces.push({ poly: [L(Y0), L(Y1), Rr(Y1), Rr(Y0)], parent: k - 1, hinge: [[0, Y0], [1, Y0]], A: k % 2 ? 179.2 : -179.2, w: [0.06 + (k - 1) * 0.31, 0.06 + k * 0.31] });
  }
  return tree('vv', faces);
}

// Sealed box — a cube net; four walls rise, the lid closes, the tuck flap locks it.
function box() {
  const f = [];
  f.push({ poly: rect(-0.5, -0.5, 0.5, 0.5), parent: -1 });
  f.push({ poly: rect(-0.5, -1.5, 0.5, -0.5), parent: 0, hinge: [[-0.5, -0.5], [0.5, -0.5]], A: 90, w: [0.0, 0.32] });
  f.push({ poly: rect(-1.5, -0.5, -0.5, 0.5), parent: 0, hinge: [[-0.5, -0.5], [-0.5, 0.5]], A: 90, w: [0.1, 0.42] });
  f.push({ poly: rect(0.5, -0.5, 1.5, 0.5), parent: 0, hinge: [[0.5, -0.5], [0.5, 0.5]], A: 90, w: [0.18, 0.5] });
  f.push({ poly: rect(-0.5, 0.5, 0.5, 1.5), parent: 0, hinge: [[-0.5, 0.5], [0.5, 0.5]], A: 90, w: [0.26, 0.58] });
  f.push({ poly: rect(-0.5, 1.5, 0.5, 2.5), parent: 4, hinge: [[-0.5, 1.5], [0.5, 1.5]], A: 90, w: [0.58, 0.88] });
  f.push({ poly: [[-0.5, 2.5], [0.5, 2.5], [0.4, 2.78], [-0.4, 2.78]], parent: 5, hinge: [[-0.5, 2.5], [0.5, 2.5]], A: 90, w: [0.8, 1] });
  return tree('box', f, { yaw: -32 });
}

// Crane — a ridge body, two swept wings, a neck and a tail that rise into the middle plane, a head turned down.
// Neck and tail directions are cut at 129° to their creases so one rotation lands each in the plane of symmetry.
function crane(p) {
  p = { body: 70, wing: 80, neck: 34.5, tail: 34.5, head: -100, ...(p || {}) };
  const f = [];
  const P = [-0.62, 0], Q = [0.62, 0], Qc = [0.62, 0.2], Pc = [-0.62, 0.2], Wf = [0.3, 0.3], Wb = [-0.3, 0.3];
  const m = (pt) => [pt[0], -pt[1]];
  const dir = (deg, sx) => [sx * Math.sin(deg * D2R), Math.cos(deg * D2R)];
  const nd = dir(129, 1), td = dir(129, -1);
  const N = [Q[0] + nd[0] * 1.05, Q[1] + nd[1] * 1.05], T = [P[0] + td[0] * 0.95, P[1] + td[1] * 0.95];
  const lerp = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
  const H1 = lerp(Q, N, 0.78), H2 = lerp(Qc, N, 0.78);
  f.push({ poly: [P, Q, Qc, Wf, Wb, Pc], parent: -1 });
  f.push({ poly: [P, Q, m(Qc), m(Wf), m(Wb), m(Pc)], parent: 0, hinge: [P, Q], A: -(180 - p.body), w: [0.0, 0.3] });
  f.push({ poly: [Wb, Wf, [0.02, 1.6]], parent: 0, hinge: [Wb, Wf], A: p.wing, w: [0.55, 0.95] });
  f.push({ poly: [m(Wb), m(Wf), [0.02, -1.6]], parent: 1, hinge: [m(Wb), m(Wf)], A: p.wing, w: [0.55, 0.95] });
  f.push({ poly: [Q, Qc, H2, H1], parent: 0, hinge: [Q, Qc], A: p.neck, w: [0.25, 0.62] });
  f.push({ poly: [H1, H2, N], parent: 4, hinge: [H1, H2], A: p.head, w: [0.7, 0.95] });
  f.push({ poly: [P, Pc, T], parent: 0, hinge: [P, Pc], A: p.tail, w: [0.3, 0.66] });
  const mdl = tree('crane', f, { yaw: 24, rootQ: qAxis(1, 0, 0, -(90 - p.body / 2)), rootW: [0, 0.3] });
  mdl.tips = { N, T };
  return mdl;
}

// Accordion leaflet — six pages pleated mountain / valley, stood on edge.
function accordion() {
  const f = [], wd = 0.55, n = 6;
  for (let k = 0; k < n; k++) f.push({ poly: rect(k * wd, 0, (k + 1) * wd, 1.05), parent: k - 1, hinge: [[k * wd, 0], [k * wd, 1]], A: k % 2 ? 128 : -128, w: [0.05 + k * 0.1, 0.45 + k * 0.1] });
  return tree('accordion', f, { yaw: -52, rootQ: qAxis(1, 0, 0, 90), rootW: [0, 0.35] });
}

// Hex tray — a hexagonal floor; six flared walls rise around it like a crate.
function hexTray() {
  const f = [], r = 0.62, h = 0.5, e = 0.17;
  const pts = Array.from({ length: 6 }, (_, k) => [r * Math.cos(k * Math.PI / 3), r * Math.sin(k * Math.PI / 3)]);
  f.push({ poly: pts, parent: -1 });
  for (let k = 0; k < 6; k++) {
    const a = pts[k], b = pts[(k + 1) % 6];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, l = Math.hypot(mx, my), ox = mx / l, oy = my / l;
    const dx = (b[0] - a[0]) / r, dy = (b[1] - a[1]) / r;
    f.push({ poly: [a, b, [b[0] + ox * h + dx * e, b[1] + oy * h + dy * e], [a[0] + ox * h - dx * e, a[1] + oy * h - dy * e]], parent: 0, hinge: [a, b], A: 66, w: [k * 0.1, 0.42 + k * 0.1] });
  }
  return tree('tray', f, { yaw: 8 });
}

// Envelope — four triangular flaps fold to the centre; the last one stays open.
function envelope() {
  const f = [], s = 0.62, d = 0.6;
  f.push({ poly: rect(-s * 1.25, -s, s * 1.25, s), parent: -1 });
  const W = s * 1.25;
  f.push({ poly: [[-W, -s], [-W, s], [-W - d * 1.1, 0]], parent: 0, hinge: [[-W, -s], [-W, s]], A: 172, w: [0, 0.3] });
  f.push({ poly: [[W, -s], [W, s], [W + d * 1.1, 0]], parent: 0, hinge: [[W, -s], [W, s]], A: 171, w: [0.12, 0.42] });
  f.push({ poly: [[-W, -s], [W, -s], [0, -s - d * 0.95]], parent: 0, hinge: [[-W, -s], [W, -s]], A: 166, w: [0.32, 0.66] });
  f.push({ poly: [[-W, s], [W, s], [0, s + d * 1.05]], parent: 0, hinge: [[-W, s], [W, s]], A: 112, w: [0.6, 1] });
  return tree('envelope', f, { yaw: -14 });
}

// Fan — a half disc pleated along its radii, stood up like a dish turning to listen.
function fan() {
  const f = [], R = 1.15, n = 12;
  for (let k = 0; k < n; k++) {
    const a0 = Math.PI * k / n, a1 = Math.PI * (k + 1) / n;
    const poly = [[0, 0]]; for (let s = 0; s <= 3; s++) { const a = a0 + (a1 - a0) * s / 3; poly.push([R * Math.cos(a), R * Math.sin(a)]); }
    f.push({ poly, parent: k - 1, hinge: [[0, 0], [Math.cos(a0), Math.sin(a0)]], A: k % 2 ? 76 : -76, w: [0.02 + k * 0.045, 0.5 + k * 0.045] });
  }
  return tree('fan', f, { yaw: 0, rootQ: qAxis(1, 0, 0, 74), rootW: [0, 0.4] });
}

// Chain — a strip of triangles, every crease folded by the same angle: a hash chain becomes a helix.
function chain(p) {
  p = { n: 16, A: -50, B: 40, ...(p || {}) };
  const f = [], s = 0.42, hh = s * Math.sqrt(3) / 2;
  const B = (k) => [k * s, 0], T = (k) => [k * s + s / 2, hh];
  for (let i = 0; i < p.n; i++) {
    const k = i >> 1;
    const poly = i % 2 === 0 ? [B(k), B(k + 1), T(k)] : [B(k + 1), T(k + 1), T(k)];
    const hinge = i === 0 ? null : i % 2 === 1 ? [B(k + 1), T(k)] : [B(k), T(k)];
    f.push({ poly, parent: i - 1, hinge: hinge || [[0, 0], [1, 0]], A: i % 2 ? p.A : p.B, w: [i * 0.045, 0.2 + i * 0.045] });
  }
  const probe = tree('chain', f);
  const out = probe.polys.map((q) => q.map(() => new Vector3()));
  probe.pose(1, {}, out);
  const cen = (k) => out[k].reduce((a, v) => a.add(v), new Vector3()).multiplyScalar(1 / out[k].length);
  const ax = new Vector3(); for (let k = 0; k < 4; k++) ax.add(cen(p.n - 1 - k)).sub(cen(k));
  const rootQ = new Quaternion().setFromUnitVectors(ax.normalize(), new Vector3(0, 1, 0));
  return tree('chain', f, { yaw: 0, rootQ, rootW: [0.25, 1] });
}

// Three place cards — each a sheet folded once into a tent.
function tents() {
  const f = [];
  for (let k = 0; k < 3; k++) {
    const u0 = -1.55 + k * 1.08, u1 = u0 + 0.9;
    f.push({ poly: rect(u0, 0, u1, 0.6), parent: -1, base: null });
    f.push({ poly: rect(u0, -0.6, u1, 0), parent: f.length - 1, hinge: [[u0, 0], [u1, 0]], A: -124, w: [0.1 + k * 0.15, 0.6 + k * 0.15] });
  }
  return tree('tents', f, { yaw: -10, rootQ: qAxis(1, 0, 0, -62), rootW: [0.1, 0.9] });
}

// A sheet folded wrong and flattened back: the crease marks stay.
function flattened() {
  const s = 0.95, f = [];
  const C = [0, 0], A = [-s, -s], Bq = [s, -s], Cq = [s, s], Dq = [-s, s];
  f.push({ poly: [A, Bq, C], parent: -1 });
  f.push({ poly: [Bq, Cq, C], parent: 0, hinge: [Bq, C], A: 7, P: 40, w: [0, 1] });
  f.push({ poly: [Dq, A, C], parent: 0, hinge: [C, A], A: -5, P: -32, w: [0, 1] });
  f.push({ poly: [Cq, Dq, C], parent: 1, hinge: [C, Cq], A: 6, P: 44, w: [0, 1] });
  return tree('flattened', f, { yaw: 18 });
}

// Index — a corrugated grid: the capability index, pleated so its rows catch the light.
function corrugated() {
  const f = [], cols = 8, wd = 0.27, hgt = 1.7;
  for (let k = 0; k < cols; k++) f.push({ poly: rect(k * wd, -hgt / 2, (k + 1) * wd, hgt / 2), parent: k - 1, hinge: [[k * wd, 0], [k * wd, 1]], A: k % 2 ? 54 : -54, w: [k * 0.06, 0.55 + k * 0.06] });
  return tree('grid', f, { yaw: -24 });
}

// Folding screen — three tall panels standing in a zigzag.
function screen() {
  const f = [], wd = 0.68, ht = 1.5;
  for (let k = 0; k < 3; k++) f.push({ poly: rect(k * wd, 0, (k + 1) * wd, ht), parent: k - 1, hinge: [[k * wd, 0], [k * wd, 1]], A: k % 2 ? 70 : -70, w: [0.3 + k * 0.2, 0.75 + k * 0.12] });
  return tree('screen', f, { yaw: 14, rootQ: qAxis(1, 0, 0, 90), rootW: [0, 0.4] });
}

// Paper plane — a keel folded in half, wings folded back out flat.
function plane(p) {
  p = { keel: 150, wing: 100, root: -75, ...(p || {}) };
  const f = [];
  const nose = [1.1, 0], tl = [-0.95, 0];
  f.push({ poly: [tl, nose, [-0.95, 0.24]], parent: -1 });
  f.push({ poly: [tl, nose, [-0.95, -0.24]], parent: 0, hinge: [tl, nose], A: p.keel, w: [0, 0.4] });
  f.push({ poly: [[-0.95, 0.24], nose, [-0.95, 1.0]], parent: 0, hinge: [nose, [-0.95, 0.24]], A: -p.wing, w: [0.4, 0.85] });
  f.push({ poly: [[-0.95, -0.24], nose, [-0.95, -1.0]], parent: 1, hinge: [nose, [-0.95, -0.24]], A: -p.wing, w: [0.4, 0.85] });
  return tree('plane', f, { yaw: -28, rootQ: qAxis(1, 0, 0, p.root), rootW: [0.3, 0.9] });
}

export const FORMS = {
  vv, box, crane, accordion, tray: hexTray, envelope, fan, chain, tents, flattened, grid: corrugated, screen, plane,
  miura: () => miura('miura', 8, 7, 0.3, 0.27, 62, 1.12, { yaw: 20 }),
};
