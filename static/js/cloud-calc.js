/**
 * Cloud-exit cost calculator (/solutions/cloud-exit/).
 * Vanilla JS; config + localized strings come from #cloudcalc-data JSON
 * (rendered by Hugo from data/portal/cloudcost.yaml — single number source).
 * Colors live in CSS custom properties; this file never hardcodes them.
 */
(function () {
  'use strict';

  var dataEl = document.getElementById('cloudcalc-data');
  var root = document.getElementById('cloudcalc');
  if (!dataEl || !root) return;

  var cfg;
  try { cfg = JSON.parse(dataEl.textContent); } catch (err) { return; }

  var state = {
    vcpu: cfg.defaults.vcpu,
    ratio: cfg.defaults.ratio,
    term: cfg.defaults.term,
    currency: cfg.defaults.currency,   // 'cny' | 'usd'
    sub: false
  };

  var $ = function (sel) { return root.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };

  function termMult() {
    for (var i = 0; i < cfg.terms.length; i++) {
      if (cfg.terms[i].key === state.term) return cfg.terms[i].mult;
    }
    return 1;
  }

  function subMonthlyCny() {
    return cfg.prices.subUsdYear / 12 * cfg.fx;
  }

  // Monthly totals in CNY, or null when the option has no data for this spec.
  function computeRows() {
    var v = state.vcpu, r = state.ratio, m = termMult();
    var aws = null, awsBasis = cfg.strings.awsOnDemand;
    var awsOd = cfg.prices.awsOd[r], aws3y = cfg.prices.aws3y[r];
    if (awsOd != null) {
      if (state.term === 'y3' || state.term === 'y5') { aws = aws3y * v; awsBasis = cfg.strings.aws3yr; }
      else { aws = awsOd * v; }
    }
    var sub = state.sub ? subMonthlyCny() : 0;
    return [
      { key: 'rds', group: 'rds', label: cfg.strings.optRds, cny: cfg.prices.aliyunRds[r] * m * v, note: '' },
      { key: 'aws', group: 'rds', label: cfg.strings.optAws, cny: aws, note: awsBasis },
      { key: 'ecs', group: 'ecs', label: cfg.strings.optEcs, cny: cfg.prices.aliyunEcs[r] * m * v + sub, note: state.sub ? cfg.strings.withSub : '' },
      { key: 'idc', group: 'self', label: cfg.strings.optIdc, cny: cfg.prices.idc * v + sub, note: state.sub ? cfg.strings.withSub : '' }
    ];
  }

  function fmtMoney(cny) {
    if (state.currency === 'usd') {
      return '$' + Math.round(cny / cfg.fx).toLocaleString(cfg.locale);
    }
    return '¥' + Math.round(cny).toLocaleString(cfg.locale);
  }

  function render() {
    var rows = computeRows();
    var visible = rows.filter(function (r) { return r.cny != null; });
    var max = Math.max.apply(null, visible.map(function (r) { return r.cny; }));
    var idc = rows[3].cny;

    rows.forEach(function (row) {
      var el = $('[data-row="' + row.key + '"]');
      if (!el) return;
      if (row.cny == null) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      var pct = Math.max(100 * row.cny / max, 0.75);
      el.querySelector('.cc-fill').style.width = pct + '%';
      el.querySelector('.cc-val').textContent = fmtMoney(row.cny) + cfg.strings.perMonth;
      var noteEl = el.querySelector('.cc-note');
      noteEl.textContent = row.note || '';
      var multEl = el.querySelector('.cc-mult');
      if (row.key === 'idc' || row.cny <= idc) {
        multEl.textContent = '';
      } else {
        multEl.textContent = '×' + (row.cny / idc).toFixed(row.cny / idc >= 10 ? 0 : 1);
      }
    });

    var awsMissing = rows[1].cny == null;
    $('.cc-aws-na').hidden = !awsMissing;

    // Headline: rent vs own at this spec. When the chosen options make renting
    // cheaper (e.g. a Pro subscription at small scale), say so instead of
    // printing a sub-1× "gap" — the honest sentence sells better anyway.
    var rds = rows[0].cny;
    var mult = rds / idc;
    var tpl = mult >= 1.05 ? cfg.strings.verdict : cfg.strings.verdictFlip;
    $('.cc-verdict').textContent = tpl
      .replace('{rds}', fmtMoney(rds))
      .replace('{idc}', fmtMoney(idc))
      .replace('{mult}', mult.toFixed(1));

    // Table view mirrors the bars.
    var tbody = $('.cc-table tbody');
    if (tbody) {
      tbody.innerHTML = '';
      rows.forEach(function (row) {
        if (row.cny == null) return;
        var tr = document.createElement('tr');
        [row.label + (row.note ? ' (' + row.note + ')' : ''),
         fmtMoney(row.cny) + cfg.strings.perMonth,
         fmtMoney(row.cny * 12) + cfg.strings.perYear,
         row.cny > idc ? '×' + (row.cny / idc).toFixed(1) : '×1'
        ].forEach(function (text, i) {
          var td = document.createElement(i === 0 ? 'th' : 'td');
          if (i === 0) td.setAttribute('scope', 'row');
          td.textContent = text;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
  }

  // Controls — pre-rendered by the template; bind here.
  var vcpuSel = $('[data-cc="vcpu"]');
  if (vcpuSel) vcpuSel.addEventListener('change', function () { state.vcpu = parseInt(this.value, 10); render(); });

  $$('[data-cc="ratio"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.ratio = this.dataset.value;
      $$('[data-cc="ratio"]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      render();
    });
  });

  $$('[data-cc="term"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.term = this.dataset.value;
      $$('[data-cc="term"]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      render();
    });
  });

  $$('[data-cc="currency"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.currency = this.dataset.value;
      $$('[data-cc="currency"]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      render();
    });
  });

  var subBox = $('[data-cc="sub"]');
  if (subBox) subBox.addEventListener('change', function () { state.sub = this.checked; render(); });

  render();
})();
