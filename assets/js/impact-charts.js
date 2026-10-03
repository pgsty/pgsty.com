/* The portal presents four fixed charts; full evidence stays in the public YAML. */
(function () {
  'use strict';
  if (!window.echarts) return;
  var palette = ['#2769a4', '#42959e', '#b1a474', '#72869a', '#82afb8', '#8b8f75', '#a18376', '#688aa7', '#9bbab0', '#a3a6b6', '#9eaf7d', '#b2b2aa'];
  var charts = [];
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    var id = root.dataset.impactChart;
    var zh = root.dataset.lang === 'zh';
    var data = JSON.parse(root.querySelector('[data-impact-data]').textContent);
    var target = root.querySelector('[data-impact-canvas]');
    var state = { selected: {}, zoom: [0, 100] };
    var chart = window.echarts.init(target, null, { renderer: 'canvas' });
    var number = new Intl.NumberFormat(zh ? 'zh-CN' : 'en-US');
    var mode = root.dataset.defaultMode;
    var current;

    function text(en, cn) { return zh ? cn : en; }
    function compact(value) {
      var magnitude = Math.abs(value);
      var unit = magnitude >= 1e9 ? [1e9, 'B'] : magnitude >= 1e6 ? [1e6, 'M'] : magnitude >= 1e3 ? [1e3, 'K'] : [1, ''];
      var scaled = value / unit[0];
      return (unit[0] === 1 ? String(Math.round(value)) : scaled.toFixed(Math.abs(scaled) < 10 ? 1 : 0)) + unit[1];
    }
    function safe(value) { return String(value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

    function dataset() {
      if (id === 'stars') return { months: data.months, series: data.repositories.map(function (r) { return { name: r.name, values: r.values }; }) };
      if (id === 'views') return { months: data.months, series: data.sites.map(function (s) { return { name: s.name, values: s.values }; }) };
      if (id === 'requests') return { months: data.monthly.map(function (r) { return r.month; }), series: [{ name: text('Cloudflare requests', 'Cloudflare 请求量'), values: data.monthly.map(function (r) { return r.requests; }) }] };
      return { rows: [
        { name: 'Docker Hub', value: data.docker_pulls, date: data.docker_source.as_of },
        { name: 'GitHub Release', value: data.github_assets, date: data.source.as_of }
      ], series: data.docker_repositories.map(function (r, i) {
        return { name: r.name, values: [r.pulls, 0], channel: 0, color: palette[i], last: i === data.docker_repositories.length - 1 };
      }).concat([{ name: 'GitHub Release', values: [0, data.github_assets], channel: 1, color: '#72869a', last: true }]) };
    }

    function colors() {
      var style = getComputedStyle(document.documentElement);
      return { ink: style.getPropertyValue('--ink-soft').trim(), heading: style.getPropertyValue('--ink-heading').trim(),
        line: style.getPropertyValue('--line').trim(), surface: style.getPropertyValue('--bg-elev').trim(),
        font: style.getPropertyValue('--font-sans').trim(), dark: document.documentElement.dataset.theme === 'dark' };
    }

    function base(c) {
      return { color: palette, backgroundColor: 'transparent', animation: !reducedMotion.matches,
        animationDuration: 250, animationDurationUpdate: 220,
        textStyle: { fontFamily: c.font, color: c.ink, fontSize: 12 },
        aria: { enabled: true, description: target.getAttribute('aria-label') },
        tooltip: { trigger: 'axis', confine: true, backgroundColor: c.surface, borderColor: c.line,
          textStyle: { color: c.heading, fontFamily: c.font }, extraCssText: 'max-width:90%;box-shadow:0 8px 28px rgba(0,0,0,.12);border-radius:8px;',
          axisPointer: { type: id === 'stars' ? 'line' : 'shadow' } }
      };
    }

    function timeOption(c) {
      var small = target.clientWidth < 600;
      var option = base(c);
      var hasLegend = id !== 'requests';
      if (hasLegend) option.legend = { type: 'scroll', top: 0, left: 0, right: 0,
        data: current.series.filter(function (s) { return s.values.some(function (v) { return v !== null && v > 0; }); }).map(function (s) { return s.name; }),
        selected: state.selected, selectedMode: id === 'stars', icon: 'roundRect', itemWidth: 14, itemHeight: 8, itemGap: small ? 16 : 24,
        textStyle: { color: c.ink, fontSize: 12 }, pageTextStyle: { color: c.ink }, pageIconColor: c.ink, pageIconInactiveColor: c.line };
      option.grid = { left: small ? 46 : 60, right: small ? 12 : 24, top: hasLegend ? 56 : 24, bottom: 70 };
      option.xAxis = { type: 'category', data: current.months, boundaryGap: id !== 'stars',
        axisLine: { lineStyle: { color: c.line } }, axisTick: { show: false },
        axisLabel: { color: c.ink, hideOverlap: true, showMinLabel: true, showMaxLabel: true, margin: 14,
          formatter: function (m) { return m.slice(5) === '01' ? m.slice(0, 4) : m; } }, axisPointer: { label: { show: false } } };
      option.yAxis = { type: 'value', min: 0, max: id === 'views' ? data.chart_y_max : undefined,
        name: id === 'stars' ? 'Star' : id === 'requests' ? text('Requests', '请求量') : 'PV', nameTextStyle: { color: c.ink, align: 'right', padding: [0, 8, 0, 0] },
        splitNumber: 4, axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: c.ink, formatter: compact }, splitLine: { lineStyle: { color: c.line, type: 'dashed' } } };
      option.dataZoom = [
        { type: 'inside', start: state.zoom[0], end: state.zoom[1], zoomOnMouseWheel: 'ctrl', moveOnMouseWheel: false, moveOnMouseMove: false },
        { type: 'slider', start: state.zoom[0], end: state.zoom[1], bottom: 5, height: 22,
          borderColor: c.line, backgroundColor: 'transparent', fillerColor: c.dark ? 'rgba(76,145,196,.16)' : 'rgba(39,105,164,.09)',
          handleStyle: { color: c.surface, borderColor: '#72869a' }, textStyle: { color: c.ink }, dataBackground: { lineStyle: { color: '#72869a' }, areaStyle: { color: '#82afb8' } },
          brushSelect: false }
      ];
      option.series = current.series.map(function (s, i) {
        var result = { name: s.name, type: id === 'stars' ? 'line' : 'bar', data: s.values,
          stack: id === 'requests' ? undefined : 'total', showSymbol: false, connectNulls: false,
          smooth: id === 'stars' ? 0.16 : false, smoothMonotone: 'x',
          lineStyle: { width: 0.85 }, areaStyle: id === 'stars' ? { opacity: 0.84 } : undefined,
          barMaxWidth: 42, itemStyle: id === 'requests' ? { borderRadius: [3, 3, 0, 0] } : undefined,
          emphasis: { focus: id === 'stars' ? 'series' : 'none' } };
        if (id === 'stars' && i === 0) result.markLine = { silent: true, symbol: ['none', 'none'],
          lineStyle: { color: c.ink, type: 'dashed', width: 1, opacity: 0.65 },
          label: { formatter: 'PGSTY · 2024', position: 'insideEndTop', rotate: 0, align: 'left', offset: [8, -4], show: !small, color: c.ink, fontSize: 11 },
          data: [{ xAxis: data.source.organization_created_at.slice(0, 7) }] };
        if (id === 'views' && i === 0) result.markPoint = { silent: true, symbol: 'triangle', symbolSize: 9,
          itemStyle: { color: c.ink }, label: { show: false },
          data: data.monthly.filter(function (r) { return r.views > data.chart_y_max; }).map(function (r) { return { coord: [r.month, data.chart_y_max], value: r.views }; }) };
        return result;
      });
      option.tooltip.formatter = function (params) {
        if (!Array.isArray(params) || !params.length) return '';
        var rows = params.filter(function (p) { return p.value !== null && p.value !== '-' && Number(p.value) > 0; }).sort(function (a, b) { return Number(b.value) - Number(a.value); });
        var total = rows.reduce(function (value, p) { return value + Number(p.value); }, 0);
        var month = params[0].axisValue;
        var heading = safe(month) + ' · <strong>' + number.format(total) + '</strong> ' + (id === 'stars' ? 'Star' : id === 'requests' ? text('requests', '次请求') : 'PV');
        var through = id === 'stars' ? data.source.as_of : data.source.end;
        if (month === through.slice(0, 7)) heading += '<br><small>' + safe(text('Through ', '截至 ') + through) + '</small>';
        if (id === 'views' && total > data.chart_y_max) heading += '<br><small>' + safe(text('Above the ', '超过 ') + compact(data.chart_y_max) + text(' display ceiling', ' 展示上限')) + '</small>';
        if (rows.length === 1) return heading;
        var other = rows.slice(10).reduce(function (value, p) { return value + Number(p.value); }, 0);
        return heading + '<div style="margin-top:8px">' + rows.slice(0, 10).map(function (p) {
          return '<div style="display:flex;gap:24px;justify-content:space-between;line-height:1.8"><span>' + p.marker + safe(p.seriesName) + '</span><strong>' + number.format(p.value) + '</strong></div>';
        }).join('') + (other ? '<div>' + safe(text('Other', '其他')) + ' · ' + number.format(other) + '</div>' : '') + '</div>';
      };
      return option;
    }

    function downloadOption(c) {
      var small = target.clientWidth < 600;
      var option = base(c);
      option.legend = { type: 'scroll', top: 0, left: 0, right: 0, selectedMode: false,
        data: current.series.filter(function (s) { return s.channel === 0; }).map(function (s) { return s.name; }),
        formatter: function (name) { return name.replace(/^pgsty\//, ''); },
        icon: 'roundRect', itemWidth: 14, itemHeight: 8, itemGap: small ? 16 : 24,
        textStyle: { color: c.ink, fontSize: 12 }, pageTextStyle: { color: c.ink },
        pageIconColor: c.ink, pageIconInactiveColor: c.line };
      option.tooltip.formatter = function (params) {
        if (!Array.isArray(params) || !params.length) return '';
        var r = current.rows[params[0].dataIndex];
        var rows = params.filter(function (p) { return Number(p.value) > 0; });
        var heading = '<strong>' + safe(r.name) + ' · ' + number.format(r.value) + '</strong> ' + safe(r.name === 'Docker Hub' ? text('pulls', '次拉取') : text('file downloads', '次文件下载')) + '<br><small>' + safe(r.date) + '</small>';
        if (r.name !== 'Docker Hub') return heading;
        return heading + '<div style="margin-top:8px">' + rows.map(function (p) {
          return '<div style="display:flex;gap:24px;justify-content:space-between;line-height:1.8"><span>' + p.marker + safe(p.seriesName) + '</span><strong>' + number.format(p.value) + '</strong></div>';
        }).join('') + '</div>';
      };
      option.grid = { left: small ? 101 : 150, right: small ? 45 : 80, top: 56, bottom: 38 };
      option.xAxis = { type: 'value', min: 0, splitNumber: small ? 3 : 5, axisLabel: { color: c.ink, formatter: compact },
        axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: c.line, type: 'dashed' } } };
      option.yAxis = { type: 'category', inverse: true, data: current.rows.map(function (r) { return r.name; }),
        axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: c.ink, fontSize: small ? 11 : 13 } };
      option.series = current.series.map(function (s) {
        return { name: s.name, type: 'bar', stack: 'channel', barMaxWidth: small ? 30 : 36,
          data: s.values, itemStyle: { color: s.color, borderRadius: s.last ? [0, 3, 3, 0] : 0 },
          emphasis: { focus: 'none' },
          label: { show: s.last, position: 'right', color: c.heading, fontSize: small ? 11 : 13,
            formatter: function (p) { return p.dataIndex === s.channel ? compact(current.rows[s.channel].value) : ''; } } };
      });
      return option;
    }

    function render() {
      current = dataset();
      chart.setOption(id === 'downloads' ? downloadOption(colors()) : timeOption(colors()), { notMerge: true });
      root.dataset.activeMode = mode;
      root.dataset.seriesCount = current.series.length;
      root.dataset.activeMetric = id;
    }

    var reset = root.querySelector('[data-chart-reset]');
    if (reset) reset.addEventListener('click', function () { state = { selected: {}, zoom: [0, 100] }; render(); });
    root.querySelector('[data-chart-export]').addEventListener('click', function () {
      var link = document.createElement('a');
      link.download = 'pgsty-impact-' + id + '.png';
      var encoded = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: colors().surface }).split(',')[1];
      var binary = atob(encoded);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      link.href = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    });
    chart.on('legendselectchanged', function (event) { state.selected = event.selected; });
    if (id !== 'downloads') chart.on('datazoom', function () { var zoom = chart.getOption().dataZoom[0]; state.zoom = [zoom.start, zoom.end]; });
    root.querySelector('.impact-chart-actions').hidden = false;
    root.classList.add('is-ready');
    render();
    if (window.ResizeObserver) new ResizeObserver(function () { chart.resize(); }).observe(target);
    charts.push({ render: render, resize: function () { chart.resize(); } });
  }

  document.querySelectorAll('[data-impact-chart]').forEach(init);
  window.addEventListener('resize', function () { charts.forEach(function (entry) { entry.render(); entry.resize(); }); });
  window.addEventListener('pgsty-theme-change', function () { charts.forEach(function (entry) { entry.render(); }); });
  reducedMotion.addEventListener('change', function () { charts.forEach(function (entry) { entry.render(); }); });
})();
