/* Mechanics engine: runs formulas stored as data. No eval, no network. */
/* Mechanics engine: runs formulas stored as data (mechanics.json). No eval, no network.
   Works in the browser (window.Mechanics) and in Node (require).

   Every formula has a status. A result is only as trustworthy as the weakest piece it used:
     verified > hypothesis > assumed > unknown
   "unknown" formulas never produce a number: calc() says what is still missing instead. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Mechanics = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var RANK = { verified: 4, hypothesis: 2, assumed: 1, unknown: 0 };

  function weaker(a, b) { return RANK[a] <= RANK[b] ? a : b; }

  function label(status) {
    if (status === 'verified') return 'computed';
    if (status === 'hypothesis' || status === 'assumed') return 'estimate';
    return "can't calculate yet";
  }

  var BUILTIN = {
    max: Math.max, min: Math.min, floor: Math.floor, ceil: Math.ceil, abs: Math.abs, trunc: Math.trunc,
    round_half_up: function (x) { return Math.floor(x + 0.5); },
    clamp: function (x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
  };

  /* ---- tiny expression parser: numbers, names, + - * /, ( ), function calls ---- */
  function tokenize(src) {
    var t = [], i = 0, c, j;
    while (i < src.length) {
      c = src.charAt(i);
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        j = i; while (j < src.length && /[0-9.]/.test(src.charAt(j))) j++;
        t.push({ k: 'num', v: parseFloat(src.slice(i, j)) }); i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        j = i; while (j < src.length && /[A-Za-z0-9_]/.test(src.charAt(j))) j++;
        t.push({ k: 'id', v: src.slice(i, j) }); i = j; continue;
      }
      if ('+-*/(),'.indexOf(c) >= 0) { t.push({ k: c }); i++; continue; }
      throw new Error('bad character "' + c + '" in expression: ' + src);
    }
    return t;
  }

  function parse(src) {
    var tk = tokenize(src), p = 0;
    function peek() { return tk[p]; }
    function eat(k) {
      var x = tk[p];
      if (!x || x.k !== k) throw new Error('expected ' + k + ' in: ' + src);
      p++; return x;
    }
    function expr() {
      var l = term(), x;
      while ((x = peek()) && (x.k === '+' || x.k === '-')) { p++; l = { t: 'bin', op: x.k, l: l, r: term() }; }
      return l;
    }
    function term() {
      var l = unary(), x;
      while ((x = peek()) && (x.k === '*' || x.k === '/')) { p++; l = { t: 'bin', op: x.k, l: l, r: unary() }; }
      return l;
    }
    function unary() {
      var x = peek();
      if (x && x.k === '-') { p++; return { t: 'neg', a: unary() }; }
      return primary();
    }
    function primary() {
      var x = peek(), args, e;
      if (!x) throw new Error('unexpected end in: ' + src);
      if (x.k === 'num') { p++; return { t: 'num', v: x.v }; }
      if (x.k === 'id') {
        p++;
        if (peek() && peek().k === '(') {
          p++; args = [];
          if (peek() && peek().k !== ')') {
            args.push(expr());
            while (peek() && peek().k === ',') { p++; args.push(expr()); }
          }
          eat(')');
          return { t: 'call', n: x.v, args: args };
        }
        return { t: 'var', n: x.v };
      }
      if (x.k === '(') { p++; e = expr(); eat(')'); return e; }
      throw new Error('unexpected "' + x.k + '" in: ' + src);
    }
    var tree = expr();
    if (p !== tk.length) throw new Error('extra input in: ' + src);
    return tree;
  }

  /* ---- engine ---- */
  function Mechanics(data) {
    this.helpers = data.helpers || {};
    this.formulas = data.formulas || {};
    this.meta = { schema: data.schema, game_version: data.game_version };
    this._cache = {};
  }

  Mechanics.prototype._ast = function (src) {
    return this._cache[src] || (this._cache[src] = parse(src));
  };

  Mechanics.prototype._eval = function (src, env, ctx) {
    var self = this;
    function go(n) {
      var a, b, h, henv, args, val;
      switch (n.t) {
        case 'num': return n.v;
        case 'var':
          if (!Object.prototype.hasOwnProperty.call(env, n.n)) throw new Error('missing input: ' + n.n);
          val = Number(env[n.n]);
          if (!isFinite(val)) throw new Error('input is not a number: ' + n.n);
          return val;
        case 'neg': return -go(n.a);
        case 'bin':
          a = go(n.l); b = go(n.r);
          if (n.op === '+') return a + b;
          if (n.op === '-') return a - b;
          if (n.op === '*') return a * b;
          if (b === 0) throw new Error('division by zero in: ' + src);
          return a / b;
        case 'call':
          args = n.args.map(go);
          if (BUILTIN[n.n]) return BUILTIN[n.n].apply(null, args);
          h = self.helpers[n.n];
          if (!h) throw new Error('unknown function: ' + n.n);
          ctx.status = weaker(ctx.status, h.status);
          if (ctx.used.indexOf(n.n) < 0) ctx.used.push(n.n);
          henv = {};
          h.vars.forEach(function (name, i) { henv[name] = args[i]; });
          return self._eval(h.expr, henv, ctx);
      }
      throw new Error('bad expression node');
    }
    return go(this._ast(src));
  };

  /* kinds: expr (one expression), switch (pick an expression by a text key),
     chain (steps applied one after another, each a percent increase),
     chain_list (same, but the steps come from the caller as a list) */
  Mechanics.prototype._run_expr = function (f, env, ctx) {
    return this._eval(f.expr, env, ctx);
  };

  Mechanics.prototype._run_switch = function (f, env, ctx) {
    var key = env[f.key], src = f.cases[key];
    if (src == null) throw new Error('unknown value for ' + f.key + ': ' + key);
    ctx.steps.push({ case: key });
    return this._eval(src, env, ctx);
  };

  Mechanics.prototype._step = function (v, p, name, ctx) {
    var after = this._eval('gained(v, p)', { v: v, p: p }, ctx);
    ctx.steps.push({ name: name, p: p, before: v, after: after });
    return after;
  };

  Mechanics.prototype._run_chain = function (f, env, ctx) {
    var self = this, v = this._eval(f.start, env, ctx);
    (f.steps || []).forEach(function (s) {
      if (s.when && !Number(env[s.when])) { ctx.steps.push({ name: s.name, skipped: true }); return; }
      v = self._step(v, self._eval(s.p, env, ctx), s.name, ctx);
    });
    return v;
  };

  Mechanics.prototype._run_chain_list = function (f, env, ctx) {
    var self = this, v = this._eval(f.start, env, ctx), list = env[f.list];
    if (!Array.isArray(list)) throw new Error('missing list: ' + f.list);
    list.forEach(function (e, i) {
      var name = e.name || ('#' + (i + 1));
      if (e.when === false || e.when === 0) { ctx.steps.push({ name: name, skipped: true }); return; }
      v = self._step(v, self._eval(f.step_p || 'p', { p: e.p }, ctx), name, ctx);
    });
    return v;
  };

  /* calc(id, inputs) -> { ok, value, status, label, used, steps } or { ok:false, reason, needs } */
  Mechanics.prototype.calc = function (id, inputs) {
    var f = this.formulas[id], ctx, env, value, runner;
    if (!f) return { ok: false, id: id, reason: 'no such formula', status: 'unknown', label: label('unknown') };
    if (f.kind === 'unknown' || f.status === 'unknown') {
      return { ok: false, id: id, reason: 'not known yet', needs: f.needs || [], status: 'unknown', label: label('unknown') };
    }
    runner = this['_run_' + f.kind];
    if (!runner) return { ok: false, id: id, reason: 'bad formula kind: ' + f.kind, status: f.status, label: label(f.status) };
    ctx = { status: f.status, used: [], steps: [] };
    env = Object.assign({}, f.consts || {}, inputs || {});
    try { value = runner.call(this, f, env, ctx); }
    catch (e) { return { ok: false, id: id, reason: e.message, status: f.status, label: label(f.status) }; }
    return { ok: true, id: id, value: value, status: ctx.status, label: label(ctx.status), used: ctx.used, steps: ctx.steps };
  };

  /* Formula-level status, cautious: the formula's own status, weakened by every helper any of its
     expressions can reach. (calc() reports the status of the actual result, which can be stronger.) */
  Mechanics.prototype.effectiveStatus = function (id) {
    var self = this, f = this.formulas[id], status, seen = {};
    if (!f) return 'unknown';
    status = f.status;
    function scan(src) {
      var re = /([A-Za-z_][A-Za-z0-9_]*)\s*\(/g, m, h;
      while ((m = re.exec(src))) {
        h = self.helpers[m[1]];
        if (h && !seen[m[1]]) { seen[m[1]] = 1; status = weaker(status, h.status); scan(h.expr); }
      }
    }
    if (f.expr) scan(f.expr);
    Object.keys(f.cases || {}).forEach(function (k) { scan(f.cases[k]); });
    (f.steps || []).forEach(function (s) { scan(s.p); });
    if (f.step_p) scan(f.step_p);
    if (f.kind === 'chain' || f.kind === 'chain_list') scan('gained(v, p)');
    return status;
  };

  /* What an answer may say about a formula, according to its "show" setting:
       result  (default) -> nothing but the result and its label
       explain           -> plus one plain sentence
       formula           -> plus the expression itself */
  Mechanics.prototype.describe = function (id) {
    var f = this.formulas[id], out;
    if (!f) return null;
    var st = this.effectiveStatus(id);
    out = { id: id, name: f.name, status: st, label: label(st), show: f.show || 'result' };
    if (out.show !== 'result') out.text = f.explain || '';
    if (out.show === 'formula') out.formula = f.expr || null;
    return out;
  };

  Mechanics.prototype.list = function () {
    var self = this;
    return Object.keys(this.formulas).map(function (id) {
      var f = self.formulas[id], st = self.effectiveStatus(id);
      return { id: id, name: f.name, status: st, label: label(st) };
    });
  };

  Mechanics.load = function (data) { return new Mechanics(data); };
  Mechanics.label = label;
  Mechanics.RANK = RANK;
  return Mechanics;
});

