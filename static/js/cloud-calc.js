/**
 * Cloud-exit cost calculators (/solutions/cloud-exit/).
 * Vanilla JS; config + localized strings come from #cloudcalc-data JSON
 * (rendered by Hugo from data/portal/cloudcost.yaml — single number source;
 * hardcoding a price here is a bug by convention).
 *
 * Model (disclosed on-page): totals = compute + storage (+ subscription on
 * self-host rows). Cloud storage is counted once (conservative — real bills
 * add replica/RO-instance storage); self-host storage carries one full copy
 * per node. Currency shows native list prices for subscriptions.
 */
(function () {
  'use strict';

  var dataEl = document.getElementById('cloudcalc-data');
  if (!dataEl) return;
  var cfg;
  try { cfg = JSON.parse(dataEl.textContent); } catch (err) { return; }

  var root = document.getElementById('cloudcalc');
  var objRoot = document.getElementById('objcalc');

  var state = {
    vcpu: cfg.defaults.vcpu,
    ratio: cfg.defaults.ratio,
    nodes: cfg.defaults.nodes,
    storageGb: cfg.defaults.storageGb,
    term: cfg.defaults.term,
    sub: cfg.defaults.sub,
    currency: cfg.defaults.currency,   // 'cny' | 'usd'
    period: 'mo',                      // 'mo' | 'yr'
    objTb: cfg.defaults.objTb
  };

  function q(scope, sel) { return scope ? scope.querySelector(sel) : null; }
  function qa(scope, sel) { return scope ? Array.prototype.slice.call(scope.querySelectorAll(sel)) : []; }

  function termMult() {
    for (var i = 0; i < cfg.terms.length; i++) if (cfg.terms[i].key === state.term) return cfg.terms[i].mult;
    return 1;
  }
  function subTier() {
    for (var i = 0; i < cfg.subs.length; i++) if (cfg.subs[i].key === state.sub) return cfg.subs[i];
    return cfg.subs[0];
  }

  function toDisp(cny) { return state.currency === 'usd' ? cny / cfg.fx : cny; }
  function periodMult() { return state.period === 'yr' ? 12 : 1; }

  function fmtMoney(disp) {
    var v = Math.round(disp * periodMult());
    return (state.currency === 'usd' ? '$' : '¥') + v.toLocaleString(cfg.locale);
  }
  function perSuffix() { return state.period === 'yr' ? cfg.strings.perYear : cfg.strings.perMonth; }

  // ---- main calculator -----------------------------------------------------

  // Components in display currency (per month).
  function computeRows() {
    var v = state.vcpu, r = state.ratio, n = state.nodes, m = termMult();
    var capGb = state.storageGb;
    var p = cfg.prices;
    var subMonthly = (state.currency === 'usd' ? subTier().usd : subTier().cny) / 12;

    // Aliyun RDS: n=1 basic single instance; n>=2 HA pair + (n-2) read-only singles.
    var aliCompute = n === 1
      ? p.aliyunRdsSingle[r] * v * m
      : (p.aliyunRds[r] + (n - 2) * p.aliyunRdsSingle[r]) * v * m;
    var aliNote = n === 1 ? cfg.strings.basicSingle
      : (n === 2 ? cfg.strings.haPair : cfg.strings.haPlusRo.replace('{n}', n - 2));

    // AWS RDS: per-instance price × n; long terms use 3-yr reserved.
    var long3y = state.term === 'y3' || state.term === 'y5';
    var awsUnit = long3y ? p.awsSingle3y[r] : p.awsSingleOd[r];
    var awsCompute = awsUnit != null ? awsUnit * v * n : null;
    var awsNote = (n === 1 ? cfg.strings.singleAz : cfg.strings.multiAz) + ' · ' +
      (long3y ? cfg.strings.aws3yr : cfg.strings.awsOnDemand);

    var essd = capGb * p.essdGb;                    // cloud disk, counted once
    var gp3 = capGb * p.gp3UsdGb * cfg.fx;          // cloud disk, counted once
    var nvme = (capGb / 1024) * p.nvmeTb;           // per node full copy

    var rows = [
      { key: 'rds', compute: toDisp(aliCompute), storage: toDisp(essd), sub: 0, note: aliNote },
      { key: 'aws', compute: awsCompute == null ? null : toDisp(awsCompute), storage: toDisp(gp3), sub: 0, note: awsNote },
      { key: 'ecs', compute: toDisp(p.aliyunEcs[r] * v * m * n), storage: toDisp(essd * n), sub: subMonthly, note: '' },
      { key: 'idc', compute: toDisp(p.idc * v * n), storage: toDisp(nvme * n), sub: subMonthly, note: '' }
    ];
    rows.forEach(function (row) {
      row.total = row.compute == null ? null : row.compute + row.storage + row.sub;
    });
    return rows;
  }

  function renderRow(el, row, max, idcTotal) {
    if (row.total == null) { el.hidden = true; return; }
    el.hidden = false;
    var wrap = q(el, '.cc-fillwrap');
    wrap.style.width = Math.max(100 * row.total / max, 0.9) + '%';
    var segs = { compute: row.compute, storage: row.storage, sub: row.sub };
    Object.keys(segs).forEach(function (k) {
      var seg = q(el, '.cc-seg--' + k);
      seg.style.flexGrow = segs[k] > 0 ? segs[k] : 0;
      seg.hidden = !(segs[k] > 0);
    });
    q(el, '.cc-val').textContent = fmtMoney(row.total) + perSuffix();
    q(el, '.cc-note').textContent = row.note || '';
    var multEl = q(el, '.cc-mult');
    multEl.textContent = (row.key !== 'idc' && row.total > idcTotal * 1.04)
      ? '×' + (row.total / idcTotal).toFixed(row.total / idcTotal >= 10 ? 0 : 1)
      : '';
  }

  function render() {
    if (!root) return;
    var rows = computeRows();
    var visible = rows.filter(function (r) { return r.total != null; });
    var max = Math.max.apply(null, visible.map(function (r) { return r.total; }));
    var idcTotal = rows[3].total;

    rows.forEach(function (row) { renderRow(q(root, '[data-row="' + row.key + '"]'), row, max, idcTotal); });
    q(root, '.cc-aws-na').hidden = rows[1].total != null;

    var rdsTotal = rows[0].total;
    var mult = rdsTotal / idcTotal;
    var tpl = mult >= 1.05 ? cfg.strings.verdict : cfg.strings.verdictFlip;
    q(root, '.cc-verdict').textContent = tpl
      .replace('{rds}', fmtMoney(rdsTotal) + perSuffix())
      .replace('{idc}', fmtMoney(idcTotal) + perSuffix())
      .replace('{mult}', mult.toFixed(1));

    var tbody = q(root, '.cc-table tbody');
    if (tbody) {
      tbody.innerHTML = '';
      rows.forEach(function (row) {
        if (row.total == null) return;
        var tr = document.createElement('tr');
        var name = cfg.strings.opts[row.key] + (row.note ? ' (' + row.note + ')' : '');
        [name, fmtMoney(row.compute), fmtMoney(row.storage), fmtMoney(row.sub), fmtMoney(row.total) + perSuffix(),
         row.total > idcTotal ? '×' + (row.total / idcTotal).toFixed(1) : '×1'
        ].forEach(function (text, i) {
          var td = document.createElement(i === 0 ? 'th' : 'td');
          if (i === 0) td.setAttribute('scope', 'row');
          td.textContent = text;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
    renderObj();
  }

  // ---- object-storage mini calculator -------------------------------------

  function renderObj() {
    if (!objRoot) return;
    var tb = state.objTb;
    var rows = cfg.obj.map(function (o) { return { key: o.key, total: toDisp(o.tbMonth * tb) }; });
    var max = Math.max.apply(null, rows.map(function (r) { return r.total; }));
    var base = rows[rows.length - 2].total; // silo3 — the practical self-host option
    rows.forEach(function (row) {
      var el = q(objRoot, '[data-orow="' + row.key + '"]');
      if (!el) return;
      q(el, '.cc-fill').style.width = Math.max(100 * row.total / max, 0.9) + '%';
      q(el, '.cc-val').textContent = fmtMoney(row.total) + perSuffix();
      var multEl = q(el, '.cc-mult');
      multEl.textContent = row.total > base * 1.04 ? '×' + (row.total / base).toFixed(1) : '';
    });
    var verdictEl = q(objRoot, '.obj-verdict');
    if (verdictEl) {
      verdictEl.textContent = cfg.strings.objVerdict
        .replace('{s3}', fmtMoney(rows[0].total) + perSuffix())
        .replace('{silo}', fmtMoney(base) + perSuffix())
        .replace('{mult}', (rows[0].total / base).toFixed(1));
    }
  }

  // ---- controls ------------------------------------------------------------

  function bindSelect(name, prop, isInt) {
    var el = document.querySelector('[data-cc="' + name + '"]');
    if (el) el.addEventListener('change', function () {
      state[prop] = isInt ? parseInt(this.value, 10) : this.value;
      render();
    });
  }
  function bindSeg(name, prop) {
    var btns = Array.prototype.slice.call(document.querySelectorAll('[data-cc="' + name + '"]'));
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state[prop] = isNaN(+btn.dataset.value) ? btn.dataset.value : +btn.dataset.value;
        btns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        render();
      });
    });
  }

  bindSelect('vcpu', 'vcpu', true);
  bindSelect('nodes', 'nodes', true);
  bindSelect('storage', 'storageGb', true);
  bindSelect('sub', 'sub', false);
  bindSelect('objtb', 'objTb', true);
  bindSeg('ratio', 'ratio');
  bindSeg('term', 'term');
  bindSeg('currency', 'currency');
  bindSeg('period', 'period');

  render();
})();
