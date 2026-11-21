import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const D = [[0, -1, 'u', 'U'], [0, 1, 'd', 'D'], [-1, 0, 'l', 'L'], [1, 0, 'r', 'R']];
const CAP = 2000000;
function parse(t) {
  const r = t.split('\n').filter(x => x.length), h = r.length, w = Math.max(...r.map(x => x.length));
  const wall = new Uint8Array(w * h).fill(1), g = [], b = [];
  let p = -1;
  r.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const c = row[x], i = y * w + x; if (c === '#') continue; wall[i] = 0; if ('.*+'.includes(c)) g.push(i); if ('$*'.includes(c)) b.push(i); if ('@+'.includes(c)) p = i; } });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!x || !y || x === w - 1 || y === h - 1) wall[y * w + x] = 1;
  return { w, h, wall, g, b: b.sort((a, c) => a - c), p };
}
function live(w, wall, g) {
  const v = new Uint8Array(wall.length), q = [...g];
  for (const x of g) v[x] = 1;
  for (let i = 0; i < q.length; i++) for (const [dx, dy] of D) { const d = dy * w + dx, y = q[i] - d; if (!wall[y] && !wall[y - d] && !v[y]) { v[y] = 1; q.push(y); } }
  return v;
}
function dist(w, wall, s) {
  const d = new Int32Array(wall.length).fill(-1), q = [s];
  d[s] = 0;
  for (let i = 0; i < q.length; i++) for (const [dx, dy] of D) { const x = q[i] + dy * w + dx; if (!wall[x] && d[x] < 0) { d[x] = d[q[i]] + 1; q.push(x); } }
  return d;
}
function region(w, wall, occ, from, seen, st, stack) {
  let low = from, n = 0;
  stack[n++] = from; seen[from] = st;
  while (n > 0) { const p = stack[--n]; if (p < low) low = p; for (let k = 0; k < 4; k++) { const q = k === 0 ? p - w : k === 1 ? p + w : k === 2 ? p - 1 : p + 1; if (!wall[q] && !occ[q] && seen[q] !== st) { seen[q] = st; stack[n++] = q; } } }
  return low;
}
function frozen(w, wall, occ, goal, t) {
  for (const a of [t, t - 1, t - w, t - w - 1]) { const b = a + 1, c = a + w, d = c + 1; if (!(wall[a] || occ[a]) || !(wall[b] || occ[b]) || !(wall[c] || occ[c]) || !(wall[d] || occ[d])) continue; if ((occ[a] && !goal[a]) || (occ[b] && !goal[b]) || (occ[c] && !goal[c]) || (occ[d] && !goal[d])) return true; }
  return false;
}
function walk(w, wall, occ, from, to) {
  if (from === to) return '';
  const prev = new Int32Array(wall.length).fill(-1), how = [], q = [from];
  prev[from] = from;
  for (let i = 0; i < q.length; i++) { const p = q[i]; if (p === to) break; for (const [dx, dy, l] of D) { const x = p + dy * w + dx; if (wall[x] || occ[x] || prev[x] !== -1) continue; prev[x] = p; how[x] = l; q.push(x); } }
  if (prev[to] === -1) return null;
  let s = '';
  for (let p = to; p !== from; p = prev[p]) s = how[p] + s;
  return s;
}
function endOf(w, from, m) { let p = from; for (const c of m.toLowerCase()) p += c === 'u' ? -w : c === 'd' ? w : c === 'l' ? -1 : 1; return p; }
function astar(L, wt) {
  const { w, wall, g } = L, size = wall.length, goal = new Uint8Array(size);
  for (const x of g) goal[x] = 1;
  const lv = live(w, wall, g);
  if (L.b.some(b => !lv[b])) return null;
  const solved = bs => bs.every(b => goal[b]);
  const gd = g.map(x => dist(w, wall, x));
  const est = bs => {
    const n = bs.length;
    if (!n) return 0;
    let best = 1 / 0;
    const used = new Array(g.length).fill(false);
    const rec = (i, sum) => { if (sum >= best) return; if (i === n) { best = sum; return; } for (let j = 0; j < g.length; j++) { if (used[j]) continue; const d = gd[j][bs[i]]; if (d < 0) continue; used[j] = true; rec(i + 1, sum + d); used[j] = false; } };
    rec(0, 0);
    return best;
  };
  const occ = new Uint8Array(size), seen = new Int32Array(size), mark = new Int32Array(size), stack = new Int32Array(size);
  let st = 0;
  const key = (bs, low) => { let k = low; for (const b of bs) k = k * size + b; return k; };
  const heap = [];
  const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && a[2] < b[2])));
  const push = e => { let i = heap.length; heap.push(e); while (i > 0) { const p = (i - 1) >> 1; if (!less(heap[i], heap[p])) break; [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; } };
  const pop = () => { const t = heap[0], l = heap.pop(); if (heap.length) { heap[0] = l; for (let i = 0; ;) { let c = 2 * i + 1; if (c >= heap.length) break; if (c + 1 < heap.length && less(heap[c + 1], heap[c])) c++; if (!less(heap[c], heap[i])) break; [heap[i], heap[c]] = [heap[c], heap[i]]; i = c; } } return t; };
  const SB = [L.b.slice()], SP = [L.p], SG = [0], par = [-1], pf = [-1], pd = [-1], best = new Map();
  for (const b of L.b) occ[b] = 1;
  const l0 = region(w, wall, occ, L.p, seen, ++st, stack);
  for (const b of L.b) occ[b] = 0;
  best.set(key(L.b, l0), 0);
  const h0 = est(L.b);
  if (!isFinite(h0)) return null;
  push([wt * h0, 0, 0]);
  if (solved(L.b)) return { pushes: 0, moves: '' };
  let found = -1;
  while (heap.length && found < 0) {
    const [, gv, s] = pop();
    if (gv !== SG[s]) continue;
    const bs = SB[s];
    for (const b of bs) occ[b] = 1;
    region(w, wall, occ, SP[s], seen, ++st, stack);
    const here = st;
    for (let bi = 0; bi < bs.length && found < 0; bi++) {
      const b = bs[bi];
      for (let k = 0; k < 4; k++) {
        const [dx, dy] = D[k], d = dy * w + dx, t = b + d;
        if (seen[b - d] !== here || wall[t] || occ[t] || !lv[t]) continue;
        occ[b] = 0; occ[t] = 1;
        if (frozen(w, wall, occ, goal, t)) { occ[t] = 0; occ[b] = 1; continue; }
        const nx = bs.slice(); nx[bi] = t; nx.sort((x, y) => x - y);
        const nl = region(w, wall, occ, b, mark, ++st, stack), kk = key(nx, nl);
        occ[t] = 0; occ[b] = 1;
        const ng = gv + 1, pb = best.get(kk);
        if (pb !== undefined && pb <= ng) continue;
        if (SB.length >= CAP) return null;
        const h = est(nx);
        if (!isFinite(h)) continue;
        best.set(kk, ng);
        const ns = SB.length;
        SB.push(nx); SP.push(b); SG.push(ng); par.push(s); pf.push(b); pd.push(k);
        if (solved(nx)) { found = ns; break; }
        push([ng + wt * h, ng, ns]);
      }
    }
    for (const b of bs) occ[b] = 0;
  }
  if (found < 0) return null;
  const path = [];
  for (let s = found; s > 0; s = par[s]) path.push(s);
  path.reverse();
  let m = '', pl = L.p, bs = L.b.slice();
  for (const s of path) {
    const from = pf[s], k = pd[s], [dx, dy, , lt] = D[k], d = dy * w + dx;
    for (const b of bs) occ[b] = 1;
    const wk = walk(w, wall, occ, pl, from - d);
    for (const b of bs) occ[b] = 0;
    if (wk === null) return null;
    m += wk + lt; pl = from; bs = SB[s].slice();
  }
  return { pushes: path.length, moves: m };
}
function rooms(L) {
  const { w, wall, g, b, p } = L, lv = live(w, wall, g), row = Math.floor(p / w), cut = new Uint8Array(wall.length);
  for (let i = row * w; i < (row + 1) * w; i++) if (!wall[i] && !lv[i]) cut[i] = 1;
  if (b.some(x => cut[x])) return null;
  const part = new Int32Array(wall.length).fill(-1), R = [];
  for (let s = 0; s < wall.length; s++) {
    if (wall[s] || cut[s] || part[s] >= 0) continue;
    const sq = [s]; part[s] = R.length;
    for (let i = 0; i < sq.length; i++) for (const [dx, dy] of D) { const q = sq[i] + dy * w + dx; if (!wall[q] && !cut[q] && part[q] < 0) { part[q] = R.length; sq.push(q); } }
    R.push({ sq, b: [], g: [], done: false });
  }
  for (const x of b) R[part[x]].b.push(x);
  for (const x of g) if (part[x] >= 0) R[part[x]].g.push(x);
  if (g.some(x => part[x] < 0)) return null;
  if (R.some(r => r.b.length !== r.g.length)) return null;
  return R.filter(r => r.b.length > 0);
}
function solve(t) {
  const L = parse(t), R = rooms(L);
  if (!R) return '';
  let pl = L.p, m = '';
  for (const r of R) {
    const wall = L.wall.slice();
    for (const o of R) if (o !== r) for (const x of o.done ? o.g : o.b) wall[x] = 1;
    const sub = { w: L.w, h: L.h, wall, g: r.g.slice().sort((a, b) => a - b), b: r.b.slice().sort((a, b) => a - b), p: pl };
    const s = astar(sub, 1) || astar(sub, 3) || astar(sub, 10);
    if (!s) return '';
    m += s.moves; pl = endOf(L.w, pl, s.moves); r.done = true;
  }
  return m;
}
for (const id of readdirSync(I).sort()) {
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'solution.txt'), `${solve(readFileSync(join(I, id, 'level.txt'), 'utf8'))}\n`);
}
