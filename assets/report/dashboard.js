/* Public static publication: an embedded snapshot or a verified same-origin bundle. */
Promise.resolve(window.REPOORT_READY).then(() => {
  "use strict";
  const I18N = window.REPOORT_I18N;
  const t = I18N?.translate || (value => String(value ?? ""));
  const locale = I18N?.locale || "zh-CN";
  const english = I18N?.language === "en";
  const DATA = window.REPOORT_DATA || {};
  const DS = DATA.datasets || {};
  const CATALOG = Array.isArray(DATA.catalog) ? DATA.catalog : [];
  const BASE = document.body.dataset.base || "";
  const DAY = 86400000;
  const $ = (id) => document.getElementById(id);
  const list = (value) => Array.isArray(value) ? value : [];
  const payload = (source) => DS[source] || {};
  const GROWTH = DATA.growth || {};
  const siloProject = () => list(GROWTH.docker_projects).find(p=>p.id==="silo") || {};
  const number = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) ? Number(value) : null;
  const esc = (value) => t(value).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const count = (value) => number(value) === null ? "—" : new Intl.NumberFormat(locale, {maximumFractionDigits: 1}).format(Number(value));
  const short = (value) => { const n = number(value); if (n === null) return "—"; if (english) { if (Math.abs(n) >= 1e9) return count(n / 1e9) + "B"; if (Math.abs(n) >= 1e6) return count(n / 1e6) + "M"; if (Math.abs(n) >= 1e3) return count(n / 1e3) + "K"; return count(n); } if (Math.abs(n) >= 1e8) return count(n / 1e8) + "亿"; if (Math.abs(n) >= 1e4) return count(n / 1e4) + "万"; return count(n); };
  const bytes = (value) => { let n = number(value); if (n === null) return "—"; const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]; let i = 0; while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; } return count(n) + " " + units[i]; };
  const money = (value) => { const n = number(value); if (n === null) return t("未确认 / 未披露"); if (english) return "$" + short(n); return n >= 1e8 ? count(n / 1e8) + " 亿美元" : n >= 1e4 ? count(n / 1e4) + " 万美元" : count(n) + " 美元"; };
  const percent = (value) => number(value) === null ? "—" : count(Number(value) * 100) + "%";
  const date = (value) => value ? String(value).slice(0, 10) : "未注明";
  const publicationDay = () => {
    const value=new Date(DATA.meta?.generated_at||NaN);
    if(!Number.isFinite(value.getTime()))return date(DATA.meta?.generated_at);
    const parts=new Intl.DateTimeFormat("en",{timeZone:DATA.meta?.default_timezone||"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(value);
    return ["year","month","day"].map(type=>parts.find(part=>part.type===type).value).join("-");
  };
  const stamp = (value) => { if (!value) return "未注明"; const d = new Date(value); return Number.isNaN(d.getTime()) ? esc(value) : new Intl.DateTimeFormat(locale, {timeZone: "Asia/Shanghai", year: "numeric", month: english ? "short" : "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false}).format(d) + " UTC+8"; };
  const safeURL = (value) => { try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol) ? u.href : ""; } catch (_) { return ""; } };
  const link = (label, url) => safeURL(url) ? `<a href="${esc(safeURL(url))}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : esc(label);
  const plain = (value) => Array.isArray(value) ? value.join(" · ") : value && typeof value === "object" ? JSON.stringify(value) : value ?? "";
  const publicText = (value) => String(value || "").replace(/\s*closed_date_basis\s*=\s*confirmation_announcement[。；;]?/gi, "").replace(/PG\s+Lite/gi, "PGlite");
  const total = (rows, key) => rows.some((r) => number(r[key]) !== null) ? rows.reduce((n, r) => n + (number(r[key]) || 0), 0) : null;
  const sorted = (rows, key) => [...rows].sort((a, b) => String(a[key] || "").localeCompare(String(b[key] || "")));
  const textWidth = (s, size = 11) => [...String(s)].reduce((n, c) => n + (/[\u2e80-\u9fff\uff00-\uffef]/.test(c) ? size : size * 0.6), 0);
  const SOURCE_NAMES = {industry: "行业公告与原文", github: "GitHub 公开 API", dockerhub: "Docker Hub 公开 API", ga: "Google Analytics Data API", cloudflare: "Cloudflare GraphQL / 日汇总", cdn: "腾讯 CDN / COS 访问日志", nginx: "Nginx 站点访问日志"};
  const SOURCE_SHORT = {industry: "行业", github: "GitHub", dockerhub: "Docker Hub", ga: "GA", cloudflare: "Cloudflare", cdn: "CDN", nginx: "Nginx"};
  const STATUS_NAMES = {complete: "已更新", partial: "部分可用", stale: "数据较旧", unknown: "日期待确认", missing: "尚无数据", failed: "更新失败", verified: "已核实", legacy: "历史研究", candidate: "待核实"};
  const SOURCE_METHODS = {
    github: "公开仓库与版本资产计数。Stars 表示仓库关注，资产下载包含重复下载；辅助文件单列。历史点为真实快照。",
    dockerhub: "公开镜像的累计 pull_count。CI、重复拉取与多架构请求会影响计数，不能解释为安装数或人数。",
    ga: "按 Property 与精确 hostname 查询。默认合计全部公开 GA 站点；月活相加各站整月查询值，跨站未去重，不累加日活。",
    cloudflare: "账号边缘请求与独立 IP，含静态资源及自动化请求。core 与 overview 单独采集；日独立 IP 不能累加为月用户。",
    cdn: "COS 小时日志增量汇总。软件下载按成功 GET、200/206 与包路径识别；整月独立 IP 在原日志中去重。",
    nginx: "按站点日志流汇总请求、字节与 IP。月独立 IP 直接去重；覆盖窗口依日志流而定，不代表可识别访客人数。",
    industry: "公司公告、官方原文与公开历史研究。宣布、交割、团队加入分别列示；金额、估值、收购价分别保存。"
  };
  const OFFICIAL = {github: "https://docs.github.com/en/rest", dockerhub: "https://docs.docker.com/reference/api/hub/latest/", ga: "https://developers.google.com/analytics/devguides/reporting/data/v1", cloudflare: "https://developers.cloudflare.com/analytics/graphql-api/", cdn: "https://cloud.tencent.com/document/product/228/6316", nginx: "https://nginx.org/en/docs/http/ngx_http_log_module.html"};
  const GROUPS = [
    ["总览", ["operations", "pigsty-growth", "industry"]],
    ["开源社区", ["github", "dockerhub", "open-source"]],
    ["网站受众", ["ga", "traffic-observation", "nginx-sites"]],
    ["边缘访问", ["cloudflare", "cloudflare-daily", "cloudflare-ytd"]],
    ["软件分发", ["cdn-traffic", "distribution", "repo-monthly-uv", "repo-system-distribution"]],
    ["扩展生态", ["extension-downloads", "extension-monthly", "extension-package-rankings"]]
  ];
  /* Observation windows. Detail views open on at least three months, overviews on a full year, and every
     view can be widened to the complete history with one click. One publication, one set of numbers. */
  const PERIODS = [["30d", "30 天", 30], ["90d", "3 个月", 90], ["180d", "6 个月", 180], ["year", "本年", null], ["1y", "1 年", 365], ["3y", "3 年", 1095], ["all", "全部历史", null]];
  const OVERVIEW_REPORTS = ["operations", "pigsty-growth"];
  /* Retired ids (former audience-specific pages) resolve to the single public report. */
  const RETIRED = {investor: "operations", "ga-investor-traffic": "ga", "extension-package-dashboard":"extension-downloads", "extension-package-dimensions":"extension-package-rankings"};
  const defaultPeriod = (id) => id === "cloudflare-ytd" ? "year" : ["repo-monthly-uv", "extension-monthly"].includes(id) ? "all" : OVERVIEW_REPORTS.includes(id) ? "1y" : "90d";
  const GA_DEFAULT = {site_id: "all", site_name: "全部 GA 站点", timezone: "各站点原时区", ...payload("ga").aggregate?.profile};
  const NGINX_DEFAULT = list(payload("nginx").daily).find((x) => x.site === "pg.center")?.site || list(payload("nginx").daily)[0]?.site || "";
  const requestedReport = RETIRED[document.body.dataset.report] || document.body.dataset.report;
  const initialReport = CATALOG.some((r) => r.id === requestedReport) ? requestedReport : "operations";
  const state = {
    report: initialReport,
    period: "90d", gaSite: String(GA_DEFAULT.site_id ?? ""), nginxSite: NGINX_DEFAULT,
    gaMetric: "uv", cfMetric: "page_views", cdnMetric: "package_downloads", grain: "auto", region: "all",
    scale: "linear", compareGroup: "china", githubMetric: "stars", githubRepo: "all", dockerRepo: "all",
    industryStatus: "verified", industryScope: "all", industryType: "all", industryCompany: "all",
    packageMap: "mapped", packageRepository: "all", packageFamily: "all", packageGroup: "logical_pkg",
    dimension: "os", archiveSection: "0", searches: {}, pages: {}
  };
  let userPeriod = null;
  state.period = defaultPeriod(state.report);
  if (state.report === "cloudflare-daily") state.cfMetric = "requests";
  const PACKAGE_DEFAULTS = {"extension-downloads":"primary_extension", "extension-package-rankings":"logical_pkg", "extension-package-dimensions":"category", "extension-package-dashboard":"logical_pkg"};
  if (PACKAGE_DEFAULTS[state.report]) state.packageGroup = PACKAGE_DEFAULTS[state.report];
  const FILTER_DEFAULTS = {...state};
  const tables = new Map();
  const charts = new Map();
  const downloadURLs = new Set();
  const toc = [];
  const openTables = new Set();
  /* Composite reports read as narratives: full tables stay one click away instead of interrupting the flow. */
  const COLLAPSED_TABLE_REPORTS = ["extension-downloads", "operations", "pigsty-growth", "distribution", "traffic-observation", "open-source"];
  let sectionNumber = 0, chartSeq = 0;
  const reportDef = () => CATALOG.find((r) => r.id === state.report) || {id: state.report, title: "Pigsty 公开指标总览", sources: Object.keys(DS)};
  const reportHref = (id) => document.body.dataset.reportRoot ? `${document.body.dataset.reportRoot}#report=${encodeURIComponent(id)}` : id === "operations" ? `${BASE}index.html` : `${BASE}reports/${encodeURIComponent(id)}/`;
  const reportLink = (id, label) => `<a href="${esc(reportHref(id))}" data-report-link="${esc(id)}">${esc(label || CATALOG.find((r) => r.id === id)?.title || id)} <span aria-hidden="true">→</span></a>`;
  const badge = (status) => `<span class="badge ${esc(status || "unknown")}">${esc(STATUS_NAMES[status] || status || "待确认")}</span>`;
  const notice = (text, type = "") => `<p class="notice ${esc(type)}">${esc(text)}</p>`;
  const empty = (text) => `<div class="empty">${esc(text)}</div>`;
  const section = (title, description, content, action = "") => {
    const n = String(++sectionNumber).padStart(2, "0"), id = `s${n}`;
    toc.push({id, n, title});
    return `<section class="section" id="${id}" aria-labelledby="${id}-t"><header class="section-head"><div class="section-heading"><span class="section-number" aria-hidden="true">${n}</span><div><h2 id="${id}-t">${esc(title)}</h2>${description ? `<p>${esc(description)}</p>` : ""}</div></div>${action ? `<div class="section-actions">${action}</div>` : ""}</header>${content}</section>`;
  };
  /* Snapshot increments only for the same repository / image, and only against an earlier day. */
  const snapDelta = (value, baseline, asOf, scope, fmt = count) => number(value) !== null && baseline && date(baseline) < date(asOf) ? {text: `${Number(value) >= 0 ? "+" : ""}${fmt(value)}`, ref: `${scope} · 较 ${date(baseline)}`, dir: Number(value) > 0 ? "up" : Number(value) < 0 ? "down" : ""} : null;
  const deltaHTML = (d) => d ? `<div class="metric-delta"><span class="delta ${esc(d.dir || "")}">${esc(d.text)}</span>${d.ref ? `<span>${esc(d.ref)}</span>` : ""}</div>` : "";
  const metricStrip = (items, extra = "") => `<div class="metric-strip ${items.length === 2 ? "two" : items.length === 3 ? "three" : items.length === 6 ? "six" : ""} ${extra}">${items.map((x) => `<div class="metric ${x.warning ? "warning" : ""}"><div class="metric-label">${esc(x.label)}</div><div class="metric-value">${esc(x.formatted ?? count(x.value))}${x.unit ? `<span class="metric-unit">${esc(x.unit)}</span>` : ""}</div>${deltaHTML(x.delta)}${deltaHTML(x.secondary)}<div class="metric-context">${esc(x.context || "")}</div></div>`).join("")}</div>`;
  const selectedSite = () => list(payload("ga").sites).find((s) => String(s.site_id) === state.gaSite) || GA_DEFAULT;
  const allGASites = () => selectedSite().site_id === "all";
  const gaName = (site = selectedSite()) => site.hostname || site.site_name || "站点";
  const gaMonthlyLabel = (metric) => `${allGASites() ? "全部站点" : "单站"}整月${metric}`;
  const gaScope = () => allGASites() ? `${count(GA_DEFAULT.public_bindings)} 个站点绑定 · 跨站未去重` : `${gaName()} · 直接整月查询`;
  const observedRange = (rows, key = "date") => {
    const dates = rows.map((r) => r[key]).filter(Boolean).sort();
    if (!dates.length) return "该窗口暂无记录";
    if (key === "year") return `${String(dates[0]).slice(0,4)} — ${String(dates[dates.length-1]).slice(0,4)}（年）`;
    if (key === "month") return `${String(dates[0]).slice(0,7)} — ${String(dates[dates.length-1]).slice(0,7)}（月）`;
    return `${date(dates[0])} — ${date(dates[dates.length - 1])}`;
  };
  const seriesMeta = (source, rows, key = "date", qualifier = "") => {
    const d = payload(source), n = rows.filter((r) => r.is_partial_day || r.is_partial_month).length;
    return `${SOURCE_NAMES[source]} · ${observedRange(rows, key)}${qualifier ? " · " + qualifier : ""}${n ? ` · ${n} 个部分窗口` : ""} · 源记录截至 ${date(d.as_of)}`;
  };
  const dayTime = (value) => Date.parse(String(value).slice(0, 10) + "T00:00:00Z");
  const referenceTime = () => dayTime(DATA.meta?.generated_at || new Date().toISOString());
  const spanDays = (rows, key = "date") => { const t = rows.map((r) => dayTime(r[key])).filter(Number.isFinite); return t.length ? (Math.max(...t) - Math.min(...t)) / DAY : 0; };
  function filterPeriod(rows, key = "date") {
    if (state.period === "all") return rows;
    if (state.period === "year") return rows.filter((r) => String(r[key] || "").slice(0, 4) === date(DATA.meta?.generated_at || new Date().toISOString()).slice(0, 4));
    if (/^\d{4}-\d{2}$/.test(state.period)) return rows.filter((r) => String(r[key] || "").startsWith(state.period));
    const days = PERIODS.find(([v]) => v === state.period)?.[2] || 90;
    const cutoff = referenceTime() - (days - 1) * DAY;
    return rows.filter((r) => {
      const start = dayTime(r[key]);
      if (key !== "month") return start >= cutoff && start <= referenceTime();
      const value = String(r[key] || ""), end = Date.UTC(Number(value.slice(0,4)), Number(value.slice(5,7)), 0);
      return end >= cutoff && start <= referenceTime();
    });
  }
  /* "auto" grain: daily detail up to ~13 months, whole-month source tables beyond that.
     Monthly uniques are always the directly-queried month values, never sums of days. */
  const resolveGrain = (dailyRows, full) => { const g = full ? state.grain : "auto"; return g === "auto" ? (spanDays(dailyRows) > 400 ? "monthly" : "daily") : g; };

  /* ---------- Controls ---------- */
  function option(value, text, current) { return `<option value="${esc(value)}"${String(current) === String(value) ? " selected" : ""}>${esc(text)}</option>`; }
  function field(key, label, options, wide = false) { return `<label class="field${wide ? " wide" : ""}"><span class="field-label">${esc(label)}</span><select data-control="${esc(key)}" aria-label="${esc(label)}">${options.map(([v, l]) => option(v, l, state[key])).join("")}</select></label>`; }
  function segmented(key, label, options) { return `<div class="field seg-field"><span class="field-label" id="seg-${esc(key)}">${esc(label)}</span><div class="segmented" role="group" aria-labelledby="seg-${esc(key)}">${options.map(([v, l]) => `<button type="button" data-set="${esc(key)}" data-value="${esc(v)}" aria-pressed="${String(state[key]) === String(v)}">${esc(l)}</button>`).join("")}</div></div>`; }
  function periodField() {
    const months = new Set();
    for (const source of reportDef().sources || []) for (const key of ["daily", "monthly", "extension_monthly", "history"]) for (const r of list(payload(source)[key])) { const x = r.month || r.date; if (x) months.add(String(x).slice(0, 7)); }
    const isMonth = /^\d{4}-\d{2}$/.test(state.period);
    const monthOptions = `<option value=""${isMonth ? "" : " selected"}>按月份查看…</option>` + [...months].sort().reverse().map((m) => option(m, m, state.period)).join("");
    return segmented("period", "观察窗口", PERIODS.map(([v, l]) => [v, l])) + `<label class="field"><span class="field-label">指定月份</span><select data-control="period" aria-label="指定月份">${monthOptions}</select></label>`;
  }
  function toolbar() {
    const id = state.report, def = reportDef();
    if (def.kind === "archive") return "";
    let fields = [];
    const trafficIds = ["operations", "pigsty-growth", "ga", "cloudflare", "cloudflare-daily", "cloudflare-ytd", "cdn-traffic", "nginx-sites", "distribution", "traffic-observation", "repo-monthly-uv", "extension-monthly", "extension-downloads"];
    if (trafficIds.includes(id)&&!OVERVIEW_REPORTS.includes(id)) fields.push(periodField());
    if (["ga", "cdn-traffic", "nginx-sites"].includes(id)) fields.push(segmented("grain", "时间粒度", [["auto", "自动"], ["daily", "每日"], ["monthly", "整月"]]));
    if (["operations", "pigsty-growth", "ga", "traffic-observation"].includes(id)) {
      fields.push(field("gaSite", "GA 站点 / Property", [["all", "全部"], ...list(payload("ga").sites).map((s) => [String(s.site_id), `${s.hostname || s.site_name} · ${s.property_id}${s.has_observed_metrics ? "" : "（暂无数据）"}`])], true));
    }
    if (id === "ga") fields.push(segmented("gaMetric", "趋势指标", [["pv", "PV"], ["uv", "活跃用户"], ["sessions", "会话"], ["new_users", "新用户"]]));
    if (id.startsWith("cloudflare")) fields.push(field("cfMetric", "趋势指标", [["page_views", "core · HTML 页面浏览"], ["requests", "core · 边缘请求"], ["bytes", "core · 传输字节"], ["uniques", "core · 日独立 IP"], ["visits_recent", "overview · Visits"], ["status_4xx_ratio_recent", "overview · 4xx 比例"]]), segmented("scale", "纵轴", [["linear", "线性"], ["log", "对数"]]));
    if (id === "cdn-traffic") {
      fields.push(field("cdnMetric", "趋势指标", [["package_downloads", "全部软件包成功 GET"], ["requests", "请求"], ["bytes", "传输字节"], ["core_downloads", "Pigsty 核心发行包"]]));
      if (resolveGrain(filterPeriod(list(payload("cdn").daily)), true) === "daily") fields.push(segmented("region", "CDN 区域", [["all", "两区域"], ["mainland", "中国大陆"], ["overseas", "海外"]]));
    }
    if (["nginx-sites", "traffic-observation"].includes(id)) fields.push(field("nginxSite", "Nginx 日志流", [...new Set(list(payload("nginx").daily).map((r) => r.site))].sort().map((x) => [x, x]), true));
    if (id === "github") fields.push(field("githubMetric", "快照指标", [["stars", "组织 Stars"], ["forks", "组织 Forks"], ["downloads_non_auxiliary", "非辅助资产下载"], ["downloads_total", "全部资产下载"]]), field("githubRepo", "仓库", [["all", "全部公开仓库"], ...list(payload("github").repositories).map((r) => [String(r.id || r.full_name), r.full_name || r.name])], true));
    if (id === "dockerhub") fields.push(field("dockerRepo", "项目 / 镜像", [["all", "全部公开镜像"], ...list(GROWTH.docker_projects).filter(p=>p.repositories.length>1).map(p=>[`project:${p.id}`,`${p.name}（项目合计）`]), ...list(payload("dockerhub").repositories).map((r) => [r.name, `pgsty/${r.name}`])]));
    if (id === "open-source") fields.push(segmented("compareGroup", "公开样本组", [["china", "中国相关项目"], ["linux", "Linux 原生代表"], ["track", "全球发行 / 管理代表"]]));
    if (id === "industry") {
      const statuses = [["verified", "已核实"], ["legacy", "历史研究"], ["candidate", "待核实线索"], ["all", "全部"]];
      fields.push(segmented("industryStatus", "核实状态", statuses), segmented("industryScope", "行业范围", [["all", "全部"], ["pg", "PostgreSQL"], ["adjacent", "相邻生态"]]), field("industryType", "事件类型", [["all", "所有类型"], ["equity_financing", "股权融资"], ["acquisition_announced", "收购宣布"], ["acquisition_closed", "收购交割"], ["team_integration", "团队加入"], ["debt_credit", "债务 / 信贷"], ["funding_aggregate", "融资累计（历史口径）"]]), field("industryCompany", "公司", [["all", "所有公司"], ...list(payload("industry").companies).sort((a, b) => a.name.localeCompare(b.name)).map((c) => [c.id, c.name])], true));
    }
    if (id.startsWith("extension-")) fields.push(segmented("packageMap", "包映射状态", [["mapped", "扩展映射包"], ["unmapped", "未映射包"], ["all", "全部"]]), field("packageRepository", "仓库路径", [["all", "全部路径"], ["pgsql", "pgsql"], ["pgdg", "pgdg"], ["infra", "infra"]]), segmented("packageFamily", "包格式", [["all", "RPM + DEB"], ["rpm", "RPM"], ["deb", "DEB"]]));
    if (["extension-downloads", "extension-package-dashboard", "extension-package-rankings", "extension-package-dimensions"].includes(id)) fields.push(field("packageGroup", "聚合维度", [["logical_pkg", "逻辑软件包"], ["primary_extension", "主扩展映射"], ["category", "扩展类别"], ["package", "发行文件"], ["family", "包格式"], ["repository", "仓库路径"]]));
    if (id === "repo-system-distribution") fields.push(segmented("dimension", "系统维度", [["os", "操作系统"], ["arch", "处理器架构"], ["client", "请求客户端"], ["delivery", "分发类型"]]));
    return fields.length ? `<div class="toolbar" role="region" aria-label="报告筛选">${fields.join("")}</div>` : "";
  }

  /* ---------- Chart engine (SVG, no dependencies) ---------- */
  const contentWidth = () => Math.max(300, $("report-content")?.clientWidth || 960);
  const gridCols = (max = 3) => { const w = contentWidth(); return Math.min(max, w >= 1060 ? 3 : w >= 660 ? 2 : 1); };
  const chartWidth = (cols = 1, compact = false) => { const pad = window.innerWidth <= 720 ? 34 : compact ? 38 : 50; return Math.max(260, Math.floor((contentWidth() - 18 * (cols - 1)) / cols - pad)); };
  function niceTicks(max, target = 4) {
    if (!(max > 0)) return {max: 1, ticks: [0, 0.25, 0.5, 0.75, 1]};
    const raw = max / target, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
    const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
    const top = Math.ceil(max * 1.02 / step) * step, ticks = [];
    for (let v = 0; v <= top + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
    return {max: top, ticks};
  }
  function timeTicks(xmin, xmax, monthly, pw = 800) {
    const out = [], span = (xmax - xmin) / DAY;
    if (xmin === xmax) out.push({t: xmin, kind: monthly ? "month" : "day"});
    else if (!monthly && span <= 75) {
      const perDay = pw / span, step = [1, 2, 7, 14, 28].find((s) => s * perDay >= 56) || 28;
      let t = xmin; if (step >= 7) t += ((8 - new Date(t).getUTCDay()) % 7) * DAY;
      for (; t <= xmax; t += step * DAY) out.push({t, kind: "day"});
    } else {
      const perMonth = pw / (span / 30.44), ms = [1, 2, 3, 6, 12, 24].find((s) => s * perMonth >= 50) || 24;
      const d0 = new Date(xmin), y = d0.getUTCFullYear(); let m = d0.getUTCMonth() + (d0.getUTCDate() > 1 ? 1 : 0);
      for (;; m++) { const t = Date.UTC(y, m, 1); if (t > xmax) break; const mm = ((m % 12) + 12) % 12, yy = new Date(t).getUTCFullYear(); if (ms <= 12 ? mm % ms === 0 : mm === 0 && yy % 2 === 0) out.push({t, kind: "month"}); }
    }
    let prevYear = null;
    return out.map((o, i) => {
      const d = new Date(o.t), yy = d.getUTCFullYear(), mo = d.getUTCMonth() + 1, dd = d.getUTCDate(), first = i === 0 || yy !== prevYear;
      const label = o.kind === "day" ? (first ? `${yy}/${mo}/${dd}` : `${mo}/${dd}`) : mo === 1 ? `${yy}` : first ? `${yy}/${mo}` : `${mo}月`;
      prevYear = yy; return {...o, label};
    });
  }
  /* Line chart: full-resolution raw values, an optional trailing moving average for long daily windows,
     hollow amber points for partial windows, gaps kept as gaps, and a hover read-out. */
  function lineFigure(title, rows, metric, opts = {}) {
    const key = opts.key || "date", monthly = key === "month", yearly = key === "year", data = sorted(rows, key), compact = !!opts.compact;
    const valid = data.filter((r) => number(r[metric]) !== null && Number.isFinite(dayTime(r[key])));
    const fmt = opts.format === "bytes" ? bytes : opts.format === "percent" ? percent : short;
    const useLog = !!opts.log;
    const isPartial = (r) => !!(r.is_partial_day || r.is_partial_month || r.is_partial_year || r.has_coverage_gap || (metric.includes("recent") && r.overview_is_partial_day));
    const caption = `${esc(opts.caption || "")}${useLog ? " 纵轴为 log10(1+x)，保留原始数值与峰值；表格仍是原计数。" : ""}`;
    const windowText = esc(opts.window || observedRange(rows, key));
    const cls = `figure${compact ? " compact" : ""}`;
    if (!valid.length) return `<figure class="${cls}"><div class="figure-head"><div class="figure-heading"><div class="figure-title">${esc(title)}</div><div class="figure-window">${windowText}</div></div></div>${empty("该窗口没有可绘制的记录；缺失值保留为空。")}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
    const w = chartWidth(opts.cols || 1, compact), h = opts.height || (compact ? 190 : w < 560 ? 220 : 290);
    const T = (n) => useLog ? Math.log10(1 + Math.max(0, n)) : Math.max(0, n);
    const maxRaw = Math.max(...valid.map((r) => Math.max(0, Number(r[metric]))));
    let yTicks, ymax;
    if (useLog) { ymax = Math.max(1, Math.ceil(Math.log10(1 + maxRaw))); yTicks = Array.from({length: ymax + 1}, (_, i) => i); }
    else { const t = niceTicks(maxRaw, compact ? 3 : 4); ymax = t.max; yTicks = t.ticks; }
    const yLabels = yTicks.map((v) => fmt(useLog ? 10 ** v - 1 : v));
    const top = opts.snapshots ? 26 : 12, bottom = 26, right = opts.axisRight || (opts.snapshots ? 30 : 10);
    const left = opts.axisLeft || Math.ceil(Math.max(28, ...yLabels.map((s) => textWidth(s))) + 12), pw = w - left - right, ph = h - top - bottom;
    let xmin = Math.min(...valid.map((r) => dayTime(r[key]))), xmax = Math.max(...valid.map((r) => dayTime(r[key])));
    if (opts.xDomain) { xmin = dayTime(opts.xDomain[0]); xmax = dayTime(opts.xDomain[1]); }
    const tickMin = xmin, tickMax = xmax;
    if (opts.snapshots && !opts.xDomain && xmax > xmin) { const pad = (xmax - xmin) * 0.06; xmin -= pad; xmax += pad; }
    const X = (t) => xmin === xmax ? left + pw / 2 : left + (t - xmin) / (xmax - xmin) * pw;
    const Y = (v) => top + ph - T(v) / ymax * ph;
    const id = `c${++chartSeq}`;
    let svg = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="grad-top"/><stop offset="1" class="grad-bottom"/></linearGradient></defs>`;
    yTicks.forEach((v, i) => { const yy = (top + ph - v / ymax * ph).toFixed(1); svg += `<line class="grid-line${i === 0 ? " base" : ""}" x1="${left}" y1="${yy}" x2="${w - right}" y2="${yy}"/><text class="axis-text" x="${left - 8}" y="${Number(yy) + 3.5}" text-anchor="end">${esc(yLabels[i])}</text>`; });
    let lastX = -Infinity;
    const xTicks = yearly ? data.map(r=>({t:dayTime(r.year),label:String(r.year).slice(0,4)})) : timeTicks(tickMin, tickMax, monthly, pw);
    for (const tick of xTicks) {
      const xx = X(tick.t), tw = textWidth(tick.label);
      if (xx < left - 2 || xx > w - right + 2 || xx - lastX < tw + 14) continue;
      const anchor = xx - tw / 2 < 0 ? "start" : xx + tw / 2 > w ? "end" : "middle";
      svg += `<text class="axis-text" x="${xx.toFixed(1)}" y="${h - 6}" text-anchor="${anchor}">${esc(tick.label)}</text>`;
      lastX = xx;
    }
    const segmentsOf = (items, value, maxGap) => {
      const segs = []; let cur = [], prev = null;
      for (const r of items) {
        const t = dayTime(r[key]), v = value(r);
        if (v === null || !Number.isFinite(t)) { if (cur.length) segs.push(cur); cur = []; prev = null; continue; }
        if (prev !== null && t - prev > maxGap) { if (cur.length) segs.push(cur); cur = []; }
        cur.push([X(t), Y(v)]); prev = t;
      }
      if (cur.length) segs.push(cur);
      return segs;
    };
    const pathOf = (seg) => seg.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
    const spanAll = (tickMax - tickMin) / DAY;
    const maN = !opts.snapshots && !monthly && !yearly && !opts.continuous && opts.smooth !== false && valid.length > 45 ? (spanAll > 400 ? 28 : 7) : 0;
    const ma = new Map();
    if (maN) {
      const base = valid.filter((r) => !isPartial(r)); let j = 0, sum = 0, n = 0;
      for (let i = 0; i < base.length; i++) {
        const t = dayTime(base[i][key]); sum += Number(base[i][metric]); n++;
        while (dayTime(base[j][key]) <= t - maN * DAY) { sum -= Number(base[j][metric]); n--; j++; }
        if (n >= Math.ceil(maN / 2)) ma.set(base[i], sum / n);
      }
    }
    const maxGap = opts.snapshots || opts.continuous ? Infinity : yearly ? 370 * DAY : monthly ? 45 * DAY : 36 * 3600000;
    const rawSegs = segmentsOf(data, (r) => number(r[metric]), maxGap);
    const mainSegs = maN ? segmentsOf(data.filter((r) => ma.has(r)), (r) => ma.get(r), maN * DAY) : rawSegs;
    if (!opts.snapshots) for (const seg of mainSegs) if (seg.length > 1) svg += `<path d="${pathOf(seg)}L${seg[seg.length-1][0].toFixed(1)},${top+ph}L${seg[0][0].toFixed(1)},${top+ph}Z" fill="url(#${id}g)"/>`;
    if (maN) for (const seg of rawSegs) svg += `<path class="line raw" d="${pathOf(seg)}"/>`;
    for (const seg of mainSegs) svg += `<path class="line${opts.snapshots ? " snap" : ""}" d="${pathOf(seg)}"/>`;
    const showPoints = opts.snapshots || (!opts.continuous && (monthly || valid.length <= 60));
    valid.forEach((r, i) => {
      const partial = isPartial(r), last = i === valid.length - 1, px = X(dayTime(r[key])), py = Y(Number(r[metric]));
      if (!(showPoints || partial || last)) return;
      if (maN && !partial && !last) return;
      svg += `<circle class="point${partial ? " partial" : ""}${last ? " last" : ""}" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${opts.snapshots ? 4.5 : partial ? 3.5 : last ? 4 : compact ? 2.3 : 2.8}"/>`;
      if (opts.snapshots) svg += `<text class="snap-label" x="${px.toFixed(1)}" y="${(py - 11).toFixed(1)}" text-anchor="middle">${esc(fmt(r[metric]))}</text>`;
    });
    svg += `<line class="hover-line" x1="0" y1="${top}" x2="0" y2="${top + ph}"/><circle class="hover-dot" r="4.5" cx="0" cy="0"/>`;
    const label = opts.seriesLabel || title.split(" · ").pop();
    charts.set(id, {w, h, label, maLabel: maN ? `${maN} 日均线` : "", pts: valid.map((r) => ({x: X(dayTime(r[key])), y: Y(Number(r[metric])), d: yearly ? String(r[key]).slice(0, 4) : monthly ? String(r[key]).slice(0, 7) : date(r[key]), v: fmt(r[metric]), m: ma.has(r) ? fmt(ma.get(r)) : "", p: isPartial(r)}))});
    const lastComplete = [...valid].reverse().find((r) => !isPartial(r)) || valid[valid.length - 1];
    const latest = opts.hideLatest ? "" : `<div class="figure-latest"><b>${esc(fmt(lastComplete[metric]))}</b><span>${esc(yearly ? String(lastComplete[key]).slice(0, 4) : monthly ? String(lastComplete[key]).slice(0, 7) : date(lastComplete[key]))}${isPartial(lastComplete) ? " · 部分" : ""}</span></div>`;
    const legendItems = [maN ? `<span class="lg raw">日值</span><span class="lg">${maN} 日均线（剔除部分日）</span>` : "", opts.snapshots ? `<span class="lg snap">真实快照之间的连线</span>` : "", valid.some(isPartial) ? `<span class="lg partial">部分窗口</span>` : ""].join("");
    const aria = `${title}。${observedRange(rows, key)}。${useLog ? "对数纵轴。" : ""}${maN ? `含 ${maN} 日均线。` : ""}数值见后续可下载表格。`;
    return `<figure class="${cls}"><div class="figure-head"><div class="figure-heading"><div class="figure-title">${esc(title)}</div><div class="figure-window">${windowText}</div></div>${latest}</div><div class="chart" data-chart="${id}"><svg viewBox="0 0 ${w} ${h}" data-x-start="${new Date(tickMin).toISOString().slice(0,10)}" data-x-end="${new Date(tickMax).toISOString().slice(0,10)}" role="img" aria-label="${esc(aria)}">${svg}</svg><div class="chart-tip" hidden></div></div>${legendItems ? `<div class="legend">${legendItems}</div>` : ""}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
  }
  /* Stacked area: month-end retained Stars per repository (largest at the bottom), with later real
     organization snapshots drawn as dashed continuation points. Always full history. */
  const STACK_COLORS = ["#336791", "#5fa8e8", "#2bb3a3", "#9b87f5", "#f2b443", "#f17a8f"];
  function starStackFigure(opts = {}) {
    const gh = payload("github"), retained = gh.retained_star_series || {}, m = retained.monthly_by_repository;
    if (!m || !list(m.months).length) return "";
    const compact = !!opts.compact, months = list(m.months), last = months.length - 1, asOf = m.as_of || retained.as_of;
    const repos = Object.entries(m.repositories || {}).map(([name, series]) => ({name, series: list(series), final: Number(list(series)[last]) || 0})).sort((a, b) => b.final - a.final);
    const top = repos.slice(0, compact ? 5 : 6), rest = repos.slice(top.length);
    const layers = top.map((r, i) => ({label: r.name, color: STACK_COLORS[i], series: r.series}));
    if (rest.length) layers.push({label: `其他 ${rest.length} 个仓库`, color: "#cbd5e1", series: months.map((_, j) => rest.reduce((n, r) => n + (Number(r.series[j]) || 0), 0))});
    const xs = months.map((mo, j) => j === last && m.last_month_partial && asOf ? dayTime(asOf) : Date.UTC(Number(mo.slice(0, 4)), Number(mo.slice(5, 7)), 0));
    const totals = months.map((_, j) => layers.reduce((n, l) => n + (Number(l.series[j]) || 0), 0));
    const snaps = list(gh.history).filter((h) => number(h.stars) !== null && asOf && date(h.date) > date(asOf)).sort((a, b) => dayTime(a.date) - dayTime(b.date));
    const w = chartWidth(opts.cols || 1, compact), h = opts.height || (compact ? 250 : w < 560 ? 340 : 420);
    const {max: ymax, ticks} = niceTicks(Math.max(...totals, ...snaps.map((x) => Number(x.stars))), compact ? 3 : 4);
    const yLabels = ticks.map((v) => short(v)), top0 = snaps.length ? 22 : 12, bottom = 26, right = snaps.length ? 34 : 12;
    const left = Math.ceil(Math.max(28, ...yLabels.map((t) => textWidth(t))) + 12), pw = w - left - right, ph = h - top0 - bottom;
    const xmin = dayTime(months[0] + "-01"), xmax = Math.max(xs[last], ...snaps.map((x) => dayTime(x.date)));
    const X = (t) => xmax === xmin ? left + pw / 2 : left + (t - xmin) / (xmax - xmin) * pw, Y = (v) => top0 + ph - v / ymax * ph;
    const id = `c${++chartSeq}`;
    let svg = "";
    ticks.forEach((v, i) => { const yy = Y(v).toFixed(1); svg += `<line class="grid-line${i === 0 ? " base" : ""}" x1="${left}" y1="${yy}" x2="${w - right}" y2="${yy}"/><text class="axis-text" x="${left - 8}" y="${Number(yy) + 3.5}" text-anchor="end">${esc(yLabels[i])}</text>`; });
    let lastX = -Infinity;
    for (const tick of timeTicks(xmin, xmax, true, pw)) {
      const xx = X(tick.t), tw = textWidth(tick.label);
      if (xx < left - 2 || xx > w - right + 2 || xx - lastX < tw + 14) continue;
      svg += `<text class="axis-text" x="${xx.toFixed(1)}" y="${h - 6}" text-anchor="middle">${esc(tick.label)}</text>`; lastX = xx;
    }
    const base = months.map(() => 0);
    for (const layer of layers) {
      const upper = months.map((_, j) => base[j] + (Number(layer.series[j]) || 0));
      const pts = (arr) => arr.map((v, j) => `${X(xs[j]).toFixed(1)},${Y(v).toFixed(1)}`);
      svg += `<path class="stack-area" fill="${layer.color}" d="M${pts(upper).join("L")}L${pts(base).reverse().join("L")}Z"/>`;
      upper.forEach((v, j) => { base[j] = v; });
    }
    svg += `<path class="line stack-total" d="M${totals.map((v, j) => `${X(xs[j]).toFixed(1)},${Y(v).toFixed(1)}`).join("L")}"/>`;
    if (snaps.length) {
      svg += `<path class="line snap stack-total" d="M${X(xs[last]).toFixed(1)},${Y(totals[last]).toFixed(1)}${snaps.map((x) => `L${X(dayTime(x.date)).toFixed(1)},${Y(Number(x.stars)).toFixed(1)}`).join("")}"/>`;
      for (const x of snaps) { const px = X(dayTime(x.date)), py = Y(Number(x.stars)); svg += `<circle class="point stack-snap" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4"/><text class="snap-label" x="${px.toFixed(1)}" y="${(py - 10).toFixed(1)}" text-anchor="end">${esc(count(x.stars))}</text>`; }
    }
    svg += `<line class="hover-line" x1="0" y1="${top0}" x2="0" y2="${top0 + ph}"/><circle class="hover-dot" r="4.5" cx="0" cy="0"/>`;
    const pts = months.map((mo, j) => ({x: X(xs[j]), y: Y(totals[j]), d: j === last && m.last_month_partial ? `${mo}（截至 ${date(asOf)}）` : mo, v: count(totals[j]), m: "", p: false,
      rows: layers.map((l) => [l.label, count(l.series[j]), l.color]).reverse()}));
    for (const x of snaps) pts.push({x: X(dayTime(x.date)), y: Y(Number(x.stars)), d: date(x.date), v: count(x.stars), m: "", p: false, rows: [[`组织实际快照 · ${count(x.repositories)} 个仓库`, count(x.stars), "#0f172a"]]});
    charts.set(id, {w, h, label: "现存 Stars 合计", maLabel: "", pts});
    const latestVal = snaps.length ? snaps[snaps.length - 1] : null;
    const latest = `<div class="figure-latest"><b>${esc(count(latestVal ? latestVal.stars : totals[last]))}</b><span>${esc(latestVal ? `${date(latestVal.date)} · 快照` : date(asOf))}</span></div>`;
    const legend = layers.map((l) => `<span class="lg swatch" style="--c:${l.color}">${esc(l.label)}</span>`).join("") + (snaps.length ? `<span class="lg snap">样本后的组织实际快照</span>` : "");
    const title = opts.title || "全部仓库 · 现存 Stars 累计（按仓库堆叠）";
    const windowText = compact ? `GitHub · ${months[0]} — ${date(snaps.length ? snaps[snaps.length - 1].date : asOf)}` : `${months[0]} — ${date(asOf)} · ${count(repos.length)} 个有 Star 的公开仓库 · 样本 ${count(m.events)} 个 Star${snaps.length ? ` · 之后接 ${snaps.length} 次组织快照` : ""}`;
    const caption = opts.caption ?? "由 GitHub 现存 Stars 的历史日计数逐月累计，各仓库堆叠后即组织合计；不含已取消的 Stars，不代表各历史日期的实时净计数。当前月累计至标注日期。";
    return `<figure class="figure${compact ? " compact" : ""}"><div class="figure-head"><div class="figure-heading"><div class="figure-title">${esc(title)}</div><div class="figure-window">${esc(windowText)}</div></div>${latest}</div><div class="chart" data-chart="${id}"><svg viewBox="0 0 ${w} ${h}" data-x-start="${new Date(xmin).toISOString().slice(0,10)}" data-x-end="${new Date(xmax).toISOString().slice(0,10)}" role="img" aria-label="${esc(`${title}。${windowText}。数值见 GitHub 报告附表。`)}">${svg}</svg><div class="chart-tip" hidden></div></div><div class="legend">${legend}</div>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
  }
  function bindCharts() {
    document.querySelectorAll(".chart[data-chart]").forEach((box) => {
      const c = charts.get(box.dataset.chart); if (!c || !c.pts.length) return;
      const svg = box.querySelector("svg"), tip = box.querySelector(".chart-tip"), line = box.querySelector(".hover-line"), dot = box.querySelector(".hover-dot");
      const move = (event) => {
        const rect = svg.getBoundingClientRect(); if (!rect.width) return;
        const vx = (event.clientX - rect.left) / rect.width * c.w;
        let lo = 0, hi = c.pts.length - 1;
        while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (c.pts[mid].x < vx) lo = mid; else hi = mid; }
        const p = Math.abs(c.pts[lo].x - vx) <= Math.abs(c.pts[hi].x - vx) ? c.pts[lo] : c.pts[hi];
        line.setAttribute("x1", p.x); line.setAttribute("x2", p.x); dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y);
        tip.innerHTML = `<div class="tip-date">${esc(p.d)}</div>${p.rows ? p.rows.map(([l, v, col]) => `<div class="tip-row"><span><i style="background:${col}"></i>${esc(l)}</span><b>${esc(v)}</b></div>`).join("") + (p.rows.length > 1 ? `<div class="tip-row total"><span>${esc(c.label)}</span><b>${esc(p.v)}</b></div>` : "") : `<div class="tip-row"><span><i></i>${esc(c.label)}</span><b>${esc(p.v)}</b></div>`}${p.m ? `<div class="tip-row ma"><span><i></i>${esc(c.maLabel)}</span><b>${esc(p.m)}</b></div>` : ""}${p.p ? `<div class="tip-note">部分窗口 · 尚未完整</div>` : ""}`;
        I18N?.localize(tip);
        tip.hidden = false; box.classList.add("hovering");
        const scale = rect.width / c.w, px = p.x * scale, py = p.y * scale, tw = tip.offsetWidth, th = tip.offsetHeight;
        const lx = px + 14 + tw > rect.width ? px - 14 - tw : px + 14;
        tip.style.transform = `translate(${Math.max(0, lx)}px, ${Math.max(0, Math.min(rect.height - th, py - th / 2))}px)`;
      };
      box.addEventListener("pointermove", move);
      box.addEventListener("pointerdown", move);
      box.addEventListener("pointerleave", () => { tip.hidden = true; box.classList.remove("hovering"); });
    });
  }
  function chartGrid(figures, cols) { const items = figures.filter(Boolean); return items.length ? `<div class="chart-grid" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${items.join("")}</div>` : ""; }
  function sharePct(p) {
    if (!(p > 0)) return "0%";
    if (p < 0.1) return "<0.1%";
    if (p < 10) return `${p.toFixed(1)}%`;
    return `${Math.round(p)}%`;
  }
  function barFigure(title, rows, labelKey, valueKey, caption = "") {
    const all = [...rows].filter((r) => number(r[valueKey]) !== null), sum = total(all, valueKey) || 0;
    const data = all.sort((a, b) => b[valueKey] - a[valueKey]).slice(0, 12);
    if (!data.length) return empty("该维度暂无可绘制数据。");
    const max = Math.max(...data.map((r) => Number(r[valueKey]))) || 1;
    const items = data.map((r, i) => { const label = String(r[labelKey] || "未分类"), v = Number(r[valueKey]); return `<li><span class="bar-rank">${i + 1}</span><span class="bar-label" title="${esc(label)}">${esc(label)}</span><span class="bar-track" aria-hidden="true"><span class="bar-fill" style="width:${Math.max(0.6, v / max * 100).toFixed(2)}%"></span></span><span class="bar-value">${esc(short(v))}${sum ? `<small>${esc(sharePct(v / sum * 100))}</small>` : ""}</span></li>`; }).join("");
    return `<figure class="figure"><div class="figure-head"><div class="figure-heading"><div class="figure-title">${esc(title)}</div><div class="figure-window">前 ${data.length} 项 · 占比按当前筛选全部 ${count(all.length)} 项计算 · 完整记录见表格</div></div></div><ol class="bars" aria-label="${esc(title + "，按数值降序。")}">${items}</ol>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
  }

  /* ---------- Tables ---------- */
  const col = (key, label, type = "text", render = null, csv = null) => ({key, label, type, render, csv});
  const dateColumn = (key = "date", label = "日期") => col(key, label, "text", (r) => esc(date(r[key])));
  const partialColumn = (key = "is_partial_day") => col(key, "窗口", "text", (r) => r[key] === true ? badge("partial") : r[key] === false ? '<span class="quiet">完整</span>' : '<span class="badge unknown">覆盖待确认</span>', (r) => r[key] === true ? "partial" : r[key] === false ? "complete" : "unknown");
  function filteredTableRows(key, rows, columns) {
    const query = String(state.searches[key] || "").trim().toLocaleLowerCase();
    if (!query) return rows;
    return rows.filter((r) => columns.some((c) => String(plain(c.csv ? c.csv(r) : r[c.key])).toLocaleLowerCase().includes(query)));
  }
  function table(key, rows, columns, opts = {}) {
    tables.set(key, {rows, columns, title: opts.title || key});
    const filtered = filteredTableRows(key, rows, columns), size = 25, pages = Math.max(1, Math.ceil(filtered.length / size)), current = Math.max(1, Math.min(state.pages[key] || 1, pages));
    state.pages[key] = current;
    const visible = filtered.slice((current-1)*size, current*size);
    const renderValue = (r, c) => c.render ? c.render(r) : c.type === "number" ? count(r[c.key]) : c.type === "bytes" ? bytes(r[c.key]) : c.type === "percent" ? percent(r[c.key]) : esc(plain(r[c.key]) || "—");
    const cellClass = (c) => ["number","bytes","percent"].includes(c.type) ? "number" : c.type === "long" ? "text-cell" : c.type === "name" ? "name-cell" : c.type === "evidence" ? "evidence" : "";
    const download = prepareCSVDownload(key, filtered, columns);
    const title = esc(opts.title || key);
    const html = `<div class="table-bar"><label><span class="sr-only">筛选${title}表格</span><input type="search" placeholder="搜索 ${title}…" value="${esc(state.searches[key] || "")}" data-search="${esc(key)}" aria-label="搜索${title}"></label><div class="table-buttons"><span>${count(filtered.length)} 条${filtered.length !== rows.length ? " / " + count(rows.length) + " 条" : ""}</span><a class="download-link" href="${esc(download.url)}" download="${esc(download.filename)}" data-export="${esc(key)}" data-row-count="${filtered.length}" aria-label="下载${title} CSV，包含当前筛选的全部 ${filtered.length} 条记录">CSV <span aria-hidden="true">↓</span></a></div></div>${visible.length ? `<div class="table-wrap" tabindex="0" role="region" aria-label="${title}，可横向滚动"><table class="data-table"><caption class="sr-only">${title}</caption><thead><tr>${columns.map((c) => `<th scope="col" class="${["number","bytes","percent"].includes(c.type) ? "number" : ""}">${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${visible.map((r) => `<tr>${columns.map((c) => `<td class="${cellClass(c)}">${renderValue(r,c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : empty("当前筛选没有记录。可调整窗口、维度或搜索词。")}${filtered.length > size ? `<div class="pagination"><span>显示 ${(current-1)*size+1}–${Math.min(current*size,filtered.length)} 条；CSV 包含当前筛选的全部 ${count(filtered.length)} 条。</span><div><button type="button" data-page="${esc(key)}" data-step="-1"${current === 1 ? " disabled" : ""}>上一页</button><span>${current} / ${pages}</span><button type="button" data-page="${esc(key)}" data-step="1"${current === pages ? " disabled" : ""}>下一页</button></div></div>` : `<p class="method">CSV 包含当前筛选的全部记录，以 UTF-8 BOM 编码，可直接在 Excel 打开。</p>`}${opts.note ? `<p class="method">${esc(opts.note)}</p>` : ""}`;
    if (!COLLAPSED_TABLE_REPORTS.includes(state.report) || opts.open) return html;
    const open = openTables.has(key) || !!state.searches[key];
    return `<details class="appendix data-appendix" data-table-key="${esc(key)}"${open ? " open" : ""}><summary>数据表 · ${title}<span class="summary-meta">${count(rows.length)} 条 · 可搜索、分页与导出 CSV</span></summary><div>${html}</div></details>`;
  }
  function prepareCSVDownload(key, rows, columns) {
    const csvField = (value) => { let s = String(plain(value)); if (typeof value !== "number" && /^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
    const body = [columns.map((c) => csvField(t(c.label))).join(","), ...rows.map((r) => columns.map((c) => csvField(typeof (c.csv ? c.csv(r) : r[c.key]) === "string" ? t(c.csv ? c.csv(r) : r[c.key]) : (c.csv ? c.csv(r) : r[c.key]))).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + body], {type: "text/csv;charset=utf-8"}), url = URL.createObjectURL(blob);
    downloadURLs.add(url);
    return {url, filename: `pigsty-${state.report}-${key}-${date(DATA.meta?.generated_at)}.csv`};
  }

  /* ---------- Sections ---------- */
  function sourceSection(sources = reportDef().sources || []) {
    const entries = sources.map((s) => {
      const d = payload(s), status = list(DATA.sources).find((x) => x.id === s) || {status: d.source ? "unknown" : "missing"};
      const coverage = d.coverage && !Array.isArray(d.coverage) ? d.coverage : {};
      const fail = status.last_run_status === "failed" ? `最近尝试 ${stamp(status.last_attempt)} 失败；展示上一份可用快照。` : "";
      const issues = list(status.issues).map((x) => typeof x === "string" ? x : x.code || x.status).filter(Boolean);
      let range = coverage.start && coverage.end ? `${date(coverage.start)} — ${date(coverage.end)}` : d.as_of ? `截至 ${date(d.as_of)}` : "日期尚未确认";
      if (s === "ga") range = "各站点独立窗口，见所选站点 / Property";
      const gaps = [...list(coverage.core_missing_dates), ...list(coverage.overview_missing_dates), ...list(coverage.absent_request_dates)].slice(0, 5).map((g) => typeof g === "string" ? g : g.start ? `${g.start} — ${g.end || g.start}` : "未注明时段");
      return `<div class="source-row"><div class="source-row-head"><h3>${esc(SOURCE_NAMES[s] || s)}</h3>${badge(status.status)}</div><p>数据日期：${esc(range)}<br>${["ga","cdn","nginx"].includes(s) ? "来源最近入库活动" : "来源采集时间"}：${stamp(d.captured_at)}${s === "ga" ? "<br>此时间不代表所有站点均已更新；绑定时间另列。" : ""}${fail ? `<br>${fail}` : ""}${issues.length ? `<br>本轮有 ${issues.length} 项覆盖或核实限制。` : ""}${gaps.length ? `<br>${s === "cloudflare" ? "core / overview 缺口（独立覆盖）" : "源日志无记录日期"}：${esc(gaps.join("；"))}` : ""}</p><p class="source-method">${esc(SOURCE_METHODS[s] || "")}</p>${OFFICIAL[s] ? `<div class="source-links">${link("上游统计接口 / 方法 ↗", OFFICIAL[s])}</div>` : ""}</div>`;
    }).join("");
    return section("来源与统计方法", "来源各自保留时间窗口；部分值、采集失败和缺口不会被改写为零。", `<div class="source-list">${entries}</div>`);
  }
  function retainedStarRows() {
    const retained = payload("github").retained_star_series || {}, byDay = new Map();
    for (const x of list(retained.series?.pigsty)) if (Array.isArray(x) && x.length >= 2 && number(x[1]) !== null) byDay.set(date(x[0]), {date: date(x[0]), stars: number(x[1])});
    return {retained, rows: [...byDay.values()]};
  }
  function retainedStarFigure(opts = {}) {
    const {retained, rows} = retainedStarRows();
    if (!rows.length) return "";
    return lineFigure("pgsty/pigsty · 现存 Stars 累计", rows, "stars", {continuous: true, smooth: false, ...starAxis(), seriesLabel: "现存 Stars 累计", window: `${starAxis().xDomain?.join(" — ") || observedRange(rows)} · 截至 ${date(retained.as_of || retained.captured_at)}`, caption: "GitHub 历史日计数按月累计；不含已取消的 Stars。与组织图共享时间轴，仓库首个历史点之前留白，当前月累计至采集日。", ...opts});
  }
  function starAxis() {
    const gh = payload("github"), m = gh.retained_star_series?.monthly_by_repository;
    return m?.months?.length ? {xDomain:[m.months[0]+"-01", gh.as_of > m.as_of ? gh.as_of : m.as_of],axisLeft:52,axisRight:14} : {};
  }
  function organizationStarFigure(opts = {}) {
    const gh = payload("github"), retained = gh.retained_star_series || {}, m = retained.monthly_by_repository;
    if (!m?.months?.length) return "";
    const rows = m.months.map((month, i) => ({date:i === m.months.length-1 ? m.as_of : new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).toISOString().slice(0,10), stars:Object.values(m.repositories||{}).reduce((sum,values)=>sum+(Number(values[i])||0),0)}));
    return lineFigure("组织 · 现存 Stars 累计",rows,"stars",{continuous:true,smooth:false,...starAxis(),seriesLabel:"组织现存 Stars",window:`${starAxis().xDomain.join(" — ")} · ${Object.keys(m.repositories||{}).length} 个有 Star 的公开仓库`,caption:"将所有公开仓库的历史累计值按日期相加；不跨仓库去重用户，不含已取消的 Stars。独立采集的组织快照仍保存在下方历史快照表中。",...opts});
  }
  function githubSection(full = false) {
    const d = payload("github"), t = d.totals || {}, delta = d.delta || {}, history = list(d.history);
    let repos = list(d.repositories); if (full && state.githubRepo !== "all") repos = repos.filter((r) => String(r.id || r.full_name) === state.githubRepo);
    const strips = metricStrip([
      {label:"公开仓库 Stars",value:t.stars,context:`${count(t.repositories)} 个仓库 · ${date(d.as_of)}`,delta:snapDelta(delta.same_repository_stars,delta.baseline_captured_at,d.as_of,"同仓库")},
      {label:"公开仓库 Forks",value:t.forks,context:"仓库关注与复用信号，保留组织范围"},
      {label:"非辅助资产下载",value:t.downloads_non_auxiliary,context:"发行软件、归档等；累计计数"},
      {label:"辅助资产下载",value:t.downloads_auxiliary,context:"校验、签名、元数据等，单独列示"}
    ]);
    const m = full ? state.githubMetric : "stars", title = {stars:"组织 Stars · 实际快照",forks:"组织 Forks · 实际快照",downloads_non_auxiliary:"非辅助资产累计下载 · 实际快照",downloads_total:"全部资产累计下载 · 实际快照"}[m];
    const cols = gridCols(2);
    const snapshot = lineFigure(title, history, m, {snapshots:true, cols, height: 250, seriesLabel: title.split(" · ")[0], window:seriesMeta("github",history), caption:"每个点是一份真实快照，虚线仅连接观察点；仓库范围可能变化。关注、下载都不是独立用户或安装数。"});
    let body = strips + (m === "stars" ? starStackFigure() + chartGrid([retainedStarFigure({cols, height: 280}), organizationStarFigure({cols,height:280}) || snapshot], cols) : snapshot);
    if (delta.baseline_captured_at) body += notice(`与 ${date(delta.baseline_captured_at)} 快照比较：同一仓库 Stars 净变化 ${count(delta.same_repository_stars)}；新增仓库带入的历史 Stars ${count(delta.added_repository_stars)}。同一资产下载计数变化 ${count(delta.same_asset_downloads)}，新资产累计计数 ${count(delta.added_assets_downloads)}。`);
    const repoColumns = [col("full_name","公开仓库","name",r=>link(r.full_name||r.name,r.url)),col("stars","Stars","number"),col("forks","Forks","number"),col("releases","版本","number"),col("downloads_non_auxiliary","非辅助下载","number"),col("downloads_auxiliary","辅助下载","number"),dateColumn("pushed_at","最近推送")];
    if (full) {
      body += `<h3>历史快照</h3>` + table("github-history",history,[dateColumn(),col("repositories","仓库数","number"),col("stars","Stars","number"),col("forks","Forks","number"),col("downloads_non_auxiliary","非辅助下载","number"),col("downloads_auxiliary","辅助下载","number")],{title:"GitHub 历史快照"});
      body += `<h3>公开仓库</h3>` + table("github-repos",[...repos].sort((a,b)=>b.stars-a.stars),repoColumns,{title:"公开仓库指标"});
      const ids = new Set(repos.map(r=>r.id));
      body += `<h3>发行资产明细</h3>` + table("github-assets",list(d.assets).filter(r=>state.githubRepo==="all"||ids.has(r.repository_id)).sort((a,b)=>b.downloads-a.downloads),[col("repository","仓库","name"),col("release_tag","版本"),col("name","公开资产","name",r=>link(r.name,r.url)),col("downloads","累计下载","number"),col("size_bytes","大小","bytes"),col("auxiliary","分类","text",r=>r.auxiliary?"辅助文件":"非辅助文件",r=>r.auxiliary?"auxiliary":"non-auxiliary"),dateColumn("created_at","创建日期")],{title:"版本资产下载"});
      const stack = d.retained_star_series?.monthly_by_repository;
      if (stack && list(stack.months).length) {
        const names = Object.keys(stack.repositories || {}).sort((a, b) => (list(stack.repositories[b]).at(-1) || 0) - (list(stack.repositories[a]).at(-1) || 0)), shown = names.slice(0, 8);
        const stackRows = list(stack.months).map((month, j) => { const row = {month, total: names.reduce((n, k) => n + (Number(stack.repositories[k][j]) || 0), 0)}; for (const k of shown) row[k] = stack.repositories[k][j]; row.other = row.total - shown.reduce((n, k) => n + (Number(row[k]) || 0), 0); return row; }).reverse();
        body += `<details class="appendix"><summary>全部仓库现存 Stars 逐月累计 · 样本截至 ${esc(date(stack.as_of))}</summary><div>${table("github-star-stack", stackRows, [col("month", "月份（月末）"), col("total", "合计", "number"), ...shown.map((k) => col(k, k, "number")), col("other", `其他 ${Math.max(0, names.length - shown.length)} 个仓库`, "number")], {title: "全部仓库现存 Stars 逐月累计", note: "按样本时仍保留的 Stars 与 starred_at 逐月累计；最后一个月截至样本日期，为部分月。不含已取消的 Stars。"})}</div></details>`;
      }
      const {retained, rows: retainedRows} = retainedStarRows();
      if (retainedRows.length) body += `<details class="appendix"><summary>历史保留 Stars 重建明细 · 样本截至 ${esc(date(retained.as_of||retained.captured_at))}</summary><div>${table("github-retained",retainedRows,[dateColumn(),col("stars","样本保留 Stars 累计","number")],{title:"历史保留 Stars 分布",note:"该旧样本与本轮组织采集日期分开保留。"})}</div></details>`;
    } else body += table("github-repos",[...repos].sort((a,b)=>b.stars-a.stars),repoColumns,{title:"公开仓库指标"});
    return section("开源社区与发行资产",`${SOURCE_NAMES.github} · 截至 ${date(d.as_of)}；组织范围公开仓库，累计计数。`,body,full?"":reportLink("github","完整社区报告"));
  }
  function dockerSection(full = false) {
    const d = payload("dockerhub"), t = d.totals || {}, delta = d.delta || {};
    const selectedProject=list(GROWTH.docker_projects).find(p=>`project:${p.id}`===state.dockerRepo);
    const names=selectedProject?.repositories||(state.dockerRepo==="all"||!full?null:[state.dockerRepo]);
    const repos = list(d.repositories).filter(r=>!names||names.includes(r.name));
    const history=names?list(d.history).map(r=>({...r,pulls:names.every(n=>number(r.repository_pulls?.[n])!==null)?names.reduce((v,n)=>v+Number(r.repository_pulls[n]),0):null})):list(d.history);
    const scope=selectedProject?.name||(names?`pgsty/${state.dockerRepo}`:"全部公开镜像");
    const pulls=selectedProject?selectedProject.pulls:total(repos,"pulls");
    const silo=siloProject();
    const projectMetric=selectedProject?.id==="silo"?{label:"项目镜像仓库",value:silo.repositories.length,context:"pgsty/minio + pgsty/silo"}:{label:"Silo 项目累计拉取",value:silo.pulls,context:"pgsty/minio + pgsty/silo · 两个仓库计数之和",delta:projectDelta(silo)};
    let body = metricStrip([{label:names?"所选镜像累计拉取":"公开镜像累计拉取",value:pulls,context:`${scope} · ${count(repos.length)} 个镜像 · ${date(d.as_of)}`,delta:!names?snapDelta(delta.same_repository_pulls,delta.baseline_captured_at,d.as_of,"同镜像",short):selectedProject?projectDelta(selectedProject):null},projectMetric,{label:"公开标签",value:total(repos,"tag_count"),context:`${scope} · 标签数不等于安装量`}]) + lineFigure(`${scope} · 累计拉取实际快照`,history,"pulls",{snapshots:true,height:260,seriesLabel:"累计拉取",window:seriesMeta("dockerhub",history),caption:"累计 pull_count 包含重复请求、CI 与多架构拉取；各点是独立采集快照，不推算逐日新增。没有仓库拆分的历史点保持为空。"});
    if (!names&&delta.baseline_captured_at) body += notice(`与 ${date(delta.baseline_captured_at)} 比较，同一镜像拉取计数变化 ${count(delta.same_repository_pulls)}；新增镜像带入历史计数 ${count(delta.added_repository_pulls)}。`);
    body += table("docker-projects",list(GROWTH.docker_projects),[col("name","项目","name",r=>link(r.name,r.url)),col("repositories","归属镜像","name",r=>esc(r.repositories.map(n=>`pgsty/${n}`).join(" + "))),col("pulls","项目累计 Pulls","number"),col("status","覆盖","text",r=>badge(r.status)),col("as_of","采集日期")],{title:"项目镜像归属",note:"Silo 合计 pgsty/minio 与 pgsty/silo；mc 独立列示。项目合计不再与成员仓库相加，拉取计数不代表独立安装。"});
    body += table("docker-repos",[...repos].sort((a,b)=>b.pulls-a.pulls),[col("name","公开镜像","name",r=>link(`${r.namespace||"pgsty"}/${r.name}`,r.url)),col("pulls","累计 Pulls","number"),col("stars","Stars","number"),col("tag_count","标签","number"),dateColumn("last_updated","最近更新")],{title:"Docker Hub 镜像"});
    if(full)body+=`<h3>公开镜像标签</h3>`+table("docker-tags",list(d.tags).filter(r=>!names||names.includes(r.repository)),[col("repository","镜像","name"),col("tag","标签","name",r=>link(r.tag,r.url)),col("architectures","架构","name"),col("size_bytes","大小","bytes"),dateColumn("last_updated","更新日期")],{title:"公开镜像标签",note:"Docker Hub 未提供标签级 pull_count，因此不估算各标签下载量。"});
    return section("镜像分发",`${SOURCE_NAMES.dockerhub} · 截至 ${date(d.as_of)}；镜像自己的累计计数。`,body,full?"":reportLink("dockerhub","镜像与标签明细"));
  }
  function comparisonSection() {
    const d = payload("github"), c = d.comparisons || {}, groups = list(c.groups), group = groups.find(g=>g.id===state.compareGroup)||groups[0]||{}, rows = list(group.samples).sort((a,b)=>(b.stars||0)-(a.stars||0));
    const groupName = {china:"中国相关公开项目",linux:"Linux 原生代表",track:"全球发行与管理代表"}[group.id] || "公开比较样本";
    let body = notice(`样本采集日期 ${date(c.as_of || c.captured_at)}。这是沿用历史报告的公开代表样本，不是完整行业普查、市场占有率或收入排行。`);
    body += barFigure(groupName + " · Stars",rows,"canonical_repo","stars","Stars 只表示仓库关注；项目定位、历史和仓库范围不同，不能直接解释为商业规模。") + table("github-comparisons",rows,[col("canonical_repo","当前仓库","name",r=>link(r.canonical_repo||r.label,r.url)),col("requested_repo","原样本名称","name"),col("stars","Stars","number"),col("forks","Forks","number"),col("archived","仓库状态","text",r=>r.archived?"已归档":"活跃",r=>r.archived?"archived":"active")],{title:"开源代表样本",note:"仓库重命名或组织迁移保留原样本名与当前 canonical 仓库；没有把历史关注数当作新获得关注。"});
    return section("开源影响力与同行比较",`独立比较样本 · ${date(c.as_of)} · ${count(rows.length)} 个代表项目。`,body);
  }
  function gaRows(grain = state.grain) {
    const s = selectedSite();
    if(allGASites())return list(payload("ga").aggregate?.[grain]);
    return list(payload("ga")[grain]).filter((r)=>String(r.site_id)===String(s.site_id)).map((r)=>grain==="monthly"?{...r,is_partial_month: typeof r.is_partial_month === "boolean" ? r.is_partial_month : monthIsPartial(r.month,s)}:r);
  }
  function monthIsPartial(month,site) {
    if(!month)return true; const end = new Date(Date.UTC(Number(String(month).slice(0,4)),Number(String(month).slice(5,7)),0)).toISOString().slice(0,10);
    return !site.last_day || date(site.last_day)<end || (site.first_day && date(site.first_day)>String(month).slice(0,7)+"-01");
  }
  function gaPeriodMetric() {
    const site=selectedSite(), rows=gaRows("monthly");
    const selected = /^\d{4}-\d{2}$/.test(state.period) ? rows.find(r=>r.month.startsWith(state.period)) : [...rows].filter(r=>!r.is_partial_month).sort((a,b)=>b.month.localeCompare(a.month))[0];
    return {site,row:selected};
  }
  /* Latest complete month and the same month one year earlier, from one source table and one metric. */
  function latestComplete(rows, metric, key = "month") {
    const ok = rows.filter((r) => r.is_partial_month === false && number(r[metric]) !== null).sort((a, b) => String(a[key]).localeCompare(String(b[key])));
    const row = ok[ok.length - 1]; if (!row) return {};
    const month = String(row[key]).slice(0, 7), prevMonth = `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`;
    const prev = ok.find((r) => String(r[key]).startsWith(prevMonth));
    return {row, month, prev, prevMonth, change: prev && number(prev[metric]) ? Number(row[metric]) / Number(prev[metric]) - 1 : null};
  }
  const yoyDelta = (info) => !info.row ? null : info.change === null ? {text: "同比 —", ref: `${info.prevMonth} 无完整月`, dir: ""} : {text: `${info.change >= 0 ? "↑" : "↓"} ${count(Math.abs(info.change) * 100)}%`, ref: `同比 ${info.prevMonth}`, dir: info.change >= 0 ? "up" : "down"};
  const changeDelta = (change, ref) => number(change)===null?null:{text:`${change>=0?"↑":"↓"} ${count(Math.abs(change)*100)}%`,ref,dir:change>0?"up":change<0?"down":""};
  const annualDelta = row => changeDelta(row?.yoy_uv, `同比 ${row?.comparison_year||""}${row?.comparison_kind==="matched_ytd"?" 同期":" 全年"}`);
  function momDelta(rows, metric) {
    const current=latestComplete(rows,metric).row;
    if(!current)return null;
    const month=new Date(dayTime(current.month));month.setUTCMonth(month.getUTCMonth()-1);
    const prior=rows.find(r=>r.month===month.toISOString().slice(0,10)&&!r.is_partial_month);
    return prior&&number(prior[metric])>0?changeDelta(current[metric]/prior[metric]-1,`环比 ${prior.month.slice(0,7)}`):null;
  }
  const projectDelta = project => {
    const rows=list(project.history).filter(r=>number(r.pulls)!==null);
    const current=rows.at(-1), previous=rows.at(-2);
    return current&&previous?snapDelta(current.pulls-previous.pulls,previous.captured_at,project.as_of,"同项目",short):null;
  };
  function gaAnnualSection() {
    const d=payload("ga"), meta=d.yearly_meta||{}, s=selectedSite();
    const rows=sorted(allGASites()?list(d.aggregate?.yearly):list(d.yearly).filter(r=>String(r.site_id)===String(s.site_id)),"year");
    const complete=[...rows].reverse().find(r=>!r.is_partial_year&&!r.has_coverage_gap&&number(r.uv)!==null);
    const current=rows.find(r=>String(r.year).slice(0,4)===String(meta.as_of||"").slice(0,4));
    const scope=allGASites()?"各站点年活相加，跨站未去重。":"单站 / Property 内按年去重。";
    let body=metricStrip([{label:"最近完整年活跃用户",value:complete?.uv,context:complete?`${String(complete.year).slice(0,4)} · 完整年 · ${gaName(s)}`:"暂无完整年记录",delta:annualDelta(complete)},{label:"本年累计活跃用户",value:current?.uv,context:current?`${date(current.window_start)} — ${date(current.window_end)} · ${current.is_partial_year?"年内累计":"完整年"}`:"暂无本年记录",delta:current?.is_partial_year?annualDelta(current):null},{label:"去年同期活跃用户",value:current?.is_partial_year?current?.comparison_uv:null,context:current?.is_partial_year?`${current.comparison_year}-01-01 — ${current.comparison_year}${String(current.window_end||"").slice(4)} · 同期直接查询`:"同期比较仅用于未结束年份"}]);
    body+=lineFigure(`${gaName(s)} · 年度活跃用户`,rows,"uv",{key:"year",seriesLabel:"年度活跃用户",window:`${observedRange(rows,"year")} · 年度采集 ${stamp(meta.captured_at)} · ${s.timezone||"原时区"}`,caption:`按自然年直接查询 GA 活跃用户，不累加月活或日活。${scope}空心点为年内累计，未结束年份只与去年同一日期范围比较；不与去年全年比较。`});
    if(!meta.captured_at)body+=notice("年度数据尚未获取，缺失值保持为空。","warning");
    else if(meta.captured_at&&Date.now()-new Date(meta.captured_at).getTime()>7*DAY)body+=notice("年度数据较旧，请以年度采集日期和截至日期为准。","warning");
    if(list(meta.bindings).some(r=>r.quality?.subject_to_thresholding||r.quality?.data_loss_from_other_row))body+=notice("GA 年度查询存在阈值或汇总行限制，数值可能不完整。","warning");
    body+=table("ga-yearly",rows,[col("year","年份","text",r=>esc(String(r.year).slice(0,4)),r=>String(r.year).slice(0,4)),col("uv","年度活跃用户","number"),col("total_users","年度总访客","number"),col("new_users","年度新用户","number"),col("pv","年度页面浏览","number"),col("sessions","年度会话","number"),dateColumn("window_end","截至日期"),col("comparison_uv","同比基期活跃用户","number"),col("comparison_kind","同比口径","text",r=>esc(r.comparison_kind==="matched_ytd"?"去年同期":"去年全年"),r=>r.comparison_kind),col("yoy_uv","活跃用户同比","percent"),col("is_partial_year","年度窗口","text",r=>esc(r.is_partial_year?"年内累计":"完整年"),r=>r.is_partial_year?"year_to_date":"full_year"),...(allGASites()?[col("observed_bindings","有记录绑定","number",r=>count(r.coverage?.observed_bindings),r=>r.coverage?.observed_bindings),col("missing_bindings","缺口绑定","number",r=>count(r.coverage?.missing_bindings),r=>r.coverage?.missing_bindings)]:[])],{title:"年度受众与同比",note:"完整年同比比较两个自然年；当前年同比比较两年同一截至日期。年度活跃用户、总访客和新用户来自各自的 GA 指标，不能互相替代。历史站点与追踪范围会变化。"});
    return section("年度网站受众",`Google Analytics · ${gaName(s)} · 按自然年直接统计，不受月度观察窗口裁切。${scope}`,body);
  }
  function gaSection(full = false) {
    const d = payload("ga"), s = selectedSite(), grain = resolveGrain(filterPeriod(gaRows("daily")), full), key = grain==="monthly"?"month":"date", rows=filterPeriod(gaRows(grain),key), metric=full?state.gaMetric:"pv", monthly=gaPeriodMetric().row;
    const labels={pv:"页面浏览 PV",uv:"活跃用户 UV",sessions:"会话",new_users:"新用户"};
    const yoy = latestComplete(gaRows("monthly"), "uv");
    const scope = allGASites() ? "按全部公开站点 / Property 绑定相加，跨站未去重。" : `精确 hostname=${s.hostname||"未注明"}，Property=${s.property_id||"未注明"}。`;
    const rate=number(monthly?.engaged_sessions)!==null&&number(monthly?.sessions)>0?monthly.engaged_sessions/monthly.sessions:null;
    let body=metricStrip([{label:gaMonthlyLabel("活跃用户"),value:monthly?.uv,context:monthly?`${String(monthly.month).slice(0,7)} · ${monthly.is_partial_month?"不完整月":"完整月"} · ${gaScope()}`:"所选范围尚无完整月记录",delta:!/^\d{4}-\d{2}$/.test(state.period)?yoyDelta(yoy):null,secondary:!/^\d{4}-\d{2}$/.test(state.period)?momDelta(gaRows("monthly"),"uv"):null},{label:gaMonthlyLabel("页面浏览"),value:monthly?.pv,context:allGASites()?gaScope():`${gaName(s)} · Property ${s.property_id||"—"}`},{label:"整月会话参与率",formatted:percent(rate),context:"参与会话 / 全部会话 · 衡量访问质量"},{label:"所选窗口会话",value:total(rows,"sessions"),context:`${observedRange(rows,key)} · 不代表期间独立用户`}]);
    body+=lineFigure(`${gaName(s)} · ${grain==="monthly"?"整月":"每日"}${labels[metric]}`,rows,metric,{key,seriesLabel:labels[metric],window:`${observedRange(rows,key)} · ${s.timezone||"原时区"} · 绑定最近观测 ${date(s.last_day)} · 绑定采集 ${stamp(s.captured_at)}`,caption:`${scope}${grain==="monthly"?"与所选日期区间重叠的整月使用直接查询值，不裁切月独立用户；当前月按截至日期显示部分值。":"日活在每天独立去重，不相加为月活；均线仅作平滑阅读。"} GA 只能观察到执行标签的访问。`});
    if(!s.has_observed_metrics)body+=notice("该站点绑定暂无观测指标。没有将未采集记录解释为零。","warning");
    body+=table("ga-series",rows,[dateColumn(key,grain==="monthly"?"月份":"日期"),col("pv","PV","number"),col("uv","活跃用户","number"),col("total_users","总用户","number"),col("new_users","新用户","number"),col("sessions","会话","number"),col("engaged_sessions","参与会话","number"),col("event_count","事件","number"),col("key_events","关键事件","number"),col("engagement_seconds","参与时长（秒）","number"),col("avg_session_seconds","平均会话时长（秒）","number"),...(allGASites()?[col("observed_bindings","有记录绑定","number",r=>count(r.coverage?.observed_bindings),r=>r.coverage?.observed_bindings),col("checked_no_rows","已查询无记录","number",r=>count(r.coverage?.checked_no_rows),r=>r.coverage?.checked_no_rows),col("missing_bindings","缺口绑定","number",r=>count(r.coverage?.missing_bindings),r=>r.coverage?.missing_bindings)]:[]),...(grain==="monthly"?[partialColumn("is_partial_month")]:[])],{title:allGASites()?"全部站点 GA 指标":"所选站点 GA 指标",note:`数据从 ${date(s.first_day)} 至 ${date(s.last_day)}，站点时区 ${s.timezone||"未注明"}。${allGASites()?"各站点同日 / 同月指标相加；平均会话时长按会话数加权。历史绑定范围会变化，缺口保持为空。":"单站指标可独立查看。"}跨站受众未去重，不代表去重总人数。`});
    if(full)body+=`<h3>公开 GA 绑定</h3>`+table("ga-sites",list(d.sites),[col("hostname","精确 hostname","name"),col("site_name","绑定名称","name"),col("property_id","Property"),col("timezone","原时区"),dateColumn("first_day","最早观测"),dateColumn("last_day","最近观测"),col("captured_at","绑定入库时间","text",r=>stamp(r.captured_at)),col("completed_start","最近成功窗口起","text",r=>esc(date(r.completed_window?.start)),r=>r.completed_window?.start||""),col("completed_end","最近成功窗口止","text",r=>esc(date(r.completed_window?.end)),r=>r.completed_window?.end||""),col("has_observed_metrics","观测状态","text",r=>r.has_observed_metrics?"有观测记录":r.completed_window?.end?"已查询 · 无观测":"尚无观测",r=>r.has_observed_metrics?"observed":r.completed_window?.end?"checked_no_observations":"missing")],{title:"公开 GA 绑定",note:"默认合计全部公开绑定，也可单独选择 hostname / Property。成功查询窗口与实际有访问的最后一天分别保存；无观测的绑定仍保留成功窗口。"});
    return section("网站受众",`Google Analytics · ${gaName(s)} · ${allGASites()?`${count(s.public_bindings)} 个站点绑定 · ${count(s.public_properties)} 个 Property`:`Property ${s.property_id||"—"}`} · ${s.timezone||"原 Property 时区"}。`,body,full?"":reportLink("ga","受众与站点明细"))+gaAnnualSection()+(full?gaGrowthSection(true):"");
  }
  function gaGrowthSection(full = false) {
    if(!allGASites())return "";
    const d=GROWTH.ga||{}, cohort=d.comparable||{}, current=cohort.current, prior=cohort.previous;
    const groups=list(d.groups).map(g=>({name:g.name,uv:g.current?.uv,bindings:g.bindings,window_end:g.current?.window_end,hostnames:g.hostnames.join(" · ")}));
    let body=metricStrip([{label:"固定站点年内活跃访客",value:current?.uv,delta:annualDelta(current),context:`${count(list(cohort.bindings).length)} 个既有绑定 · ${date(current?.window_start)} — ${date(current?.window_end)}`},{label:"同范围去年同期",value:prior?.uv,context:`${date(prior?.window_start)} — ${date(prior?.window_end)} · 相同绑定范围`}]);
    body+=chartGrid([lineFigure("固定站点 · 整月活跃用户",list(cohort.monthly),"uv",{key:"month",compact:true,cols:2,seriesLabel:"整月活跃用户",window:list(cohort.hostnames).join(" + "),caption:"仅纳入去年开始前已有观测的绑定；按同一绑定集合比较，跨站未去重。年内活跃访客直接查询，不累加月活。"}),barFigure("年内受众来源",groups,"name","uv",`截至 ${date(d.current?.window_end)} · 产品、文档与内容站点分组；各站点 / Property 相加，跨站未去重。`)],2);
    if(cohort.status!=="complete")body+=notice("固定站点同期数据不完整，增长率保持为空。","warning");
    body+=table("ga-audience-groups",groups,[col("name","受众来源","name"),col("uv","年内活跃访客合计","number"),col("bindings","站点绑定","number"),dateColumn("window_end","截至日期"),col("hostnames","包含站点","name")],{title:"受众来源拆分",note:"全站合计保留全部公开绑定；来源分组互不重叠。产品站访问不等于产品活跃安装，内容站访问不等于产品用户。"});
    if(full)body+=table("ga-comparable",list(cohort.monthly),[dateColumn("month","月份"),col("uv","活跃用户","number"),col("pv","PV","number"),col("sessions","会话","number"),partialColumn("is_partial_month")],{title:"固定站点月度受众",note:"绑定集合按基期之前已有观测选择，并保留同期缺口；首次观测不是站点或产品上线日期。"});
    return section("受众增长的来源",`全部站点体现传播规模，固定站点组帮助阅读可比增长。统计范围：${list(cohort.hostnames).join(" + ")||"暂无可比站点"}。`,body,full?"":reportLink("ga","受众与站点明细"));
  }
  function cfSection(full = false) {
    const d=payload("cloudflare"), rows=filterPeriod(list(d.daily)), complete=rows.filter(r=>r.is_partial_day===false), metric=full?state.cfMetric:"requests", overview=metric.includes("recent"), labels={page_views:"core · HTML 页面浏览",requests:"core · 边缘请求",bytes:"core · 传输字节",uniques:"core · 日独立 IP",visits_recent:"overview · Visits",status_4xx_ratio_recent:"overview · 4xx 响应比例"};
    const ip = complete.filter(r=>number(r.uniques)!==null), recent = rows.filter(r=>number(r.visits_recent)!==null&&r.overview_is_partial_day===false);
    let body=metricStrip([{label:"窗口完整日边缘请求",value:total(complete,"requests"),context:`${complete.length} 个完整日 · UTC`},{label:"窗口完整日 HTML 浏览",value:total(complete,"page_views"),context:"边缘成功 HTML 响应，不是 GA 页面事件"},{label:"完整日传输量",formatted:bytes(total(complete,"bytes")),context:"与请求数独立的字节单位"},{label:"日独立 IP 均值",value:ip.length?total(ip,"uniques")/ip.length:null,context:"只作日均值；期间独立 IP 未提供"}]);
    body+=lineFigure(labels[metric]||metric,rows,metric,{seriesLabel:(labels[metric]||metric).split(" · ").pop(),window:seriesMeta("cloudflare",rows,"date","UTC · Pigsty.IO 账号"),format:metric==="bytes"?"bytes":metric.includes("ratio")?"percent":undefined,log:full&&state.scale==="log",caption:"原始峰值完整保留，空心点为部分日。core 与 overview 各自标记部分日；缺失 Visits 保持空值，曲线在缺口处断开。账号请求包含自动化访问、扫描与静态资源。"});
    const corePartial=rows.filter(r=>r.is_partial_day===true).length, coreUnknown=rows.filter(r=>r.is_partial_day!==true&&r.is_partial_day!==false).length, overviewMissing=rows.filter(r=>r.visits_recent===null||r.visits_recent===undefined).length, overviewPartial=rows.filter(r=>r.overview_is_partial_day===true).length;
    if(corePartial||coreUnknown||overviewMissing||overviewPartial)body+=notice(`所选窗口：core ${corePartial} 个部分日${coreUnknown?`、${coreUnknown} 个覆盖待确认日`:""}；overview ${overviewMissing} 天无 Visits，${overviewPartial} 个部分日。上方累计指标只加已确认完整 core 日；overview 完整日 ${recent.length} 天。两种日数据的覆盖范围分别保留。`,"warning");
    const cols=[dateColumn(),col("requests","core 请求","number"),col("page_views","core HTML PV","number"),col("bytes","core 字节","bytes"),col("uniques","日独立 IP","number"),partialColumn(),col("visits_recent","overview Visits","number"),col("overview_is_partial_day","overview 窗口","text",r=>r.overview_is_partial_day===null||r.overview_is_partial_day===undefined?"未采集":r.overview_is_partial_day?badge("partial"):"完整",r=>r.overview_is_partial_day==null?"missing":r.overview_is_partial_day?"partial":"complete")];
    body+=table("cf-series",rows,cols,{title:"Cloudflare 日指标",note:"日独立 IP 不相加为月活 / 总访客。CF 与 GA 的覆盖、单位和机制不同，不能相减推算机器人比例。"});
    if(full&&overview)body+=table("cf-overview",rows,[dateColumn(),col("visits_recent","Visits","number"),col("cache_request_ratio_recent","缓存请求比例","percent"),col("cache_bytes_ratio_recent","缓存字节比例","percent"),col("status_4xx_ratio_recent","4xx 比例","percent"),col("status_5xx_ratio_recent","5xx 比例","percent")],{title:"Cloudflare overview",note:"overview 为独立数据集，缺失值不以 core 替代。"});
    return section(full&&state.report==="cloudflare-ytd"?"Cloudflare 年内观察":"边缘访问",`账号级汇总 · ${observedRange(rows)} · UTC。`,body,full?"":reportLink("cloudflare-daily","完整日趋势"));
  }
  function aggregate(rows,key,fields) {
    const groups=new Map();
    for(const r of rows){const id=String(r[key]||"");if(!groups.has(id))groups.set(id,{[key]:id,is_partial_day:false,is_partial_month:false});const target=groups.get(id);for(const f of fields){if(number(r[f])!==null)target[f]=(number(target[f])||0)+Number(r[f]);}for(const flag of ["is_partial_day","is_partial_month"]){if(r[flag]===true)target[flag]=true;else if(r[flag]!==false)target["unknown_"+flag]=true;}}
    return sorted([...groups.values()].map(r=>{for(const flag of ["is_partial_day","is_partial_month"]){if(r["unknown_"+flag]&&r[flag]!==true)r[flag]=null;delete r["unknown_"+flag];}return r;}),key);
  }
  function cdnRows(grain="daily") {
    const d=payload("cdn");
    if(grain==="monthly")return list(d.monthly).filter(r=>r.region==="all"||!r.region);
    const rows=list(d.daily).filter(r=>state.region==="all"||r.region===state.region);
    if(state.region!=="all")return rows;
    return aggregate(rows,"date",["requests","bytes","responses_2xx","responses_4xx","responses_5xx","package_downloads","rpm_downloads","deb_downloads","core_downloads"]);
  }
  function cdnSection(full=false) {
    const d=payload("cdn"), grain=resolveGrain(filterPeriod(list(d.daily)), full), key=grain==="monthly"?"month":"date", rows=filterPeriod(cdnRows(grain),key), m=full?state.cdnMetric:"package_downloads", labels={package_downloads:"全部软件包成功 GET",requests:"CDN 请求",bytes:"CDN 传输字节",core_downloads:"Pigsty 核心发行包 GET"};
    let body=metricStrip([{label:"窗口软件包成功 GET",value:total(rows,"package_downloads"),context:"RPM / DEB · 200/206 · 包路径匹配"},{label:"RPM 包成功 GET",value:total(rows,"rpm_downloads"),context:`${observedRange(rows,key)}`},{label:"DEB 包成功 GET",value:total(rows,"deb_downloads"),context:"请求计数包含重试和重复分发"},{label:"窗口分发字节",formatted:bytes(total(rows,"bytes")),context:"包含全部请求资源，非仅软件包"}]);
    body+=lineFigure(`${grain==="monthly"?"整月":"每日"}${labels[m]}`,rows,m,{key,seriesLabel:labels[m],format:m==="bytes"?"bytes":undefined,window:seriesMeta("cdn",rows,key,"Asia/Shanghai"),caption:`${grain==="monthly"?"整月 all 区域源表；展示与日期区间重叠的整月记录，不裁切整月去重 IP。":state.region==="all"?"请求、字节和成功 GET 可在两区域相加；日独立 IP 不相加。":"所选区域独立计数。"} 小时覆盖不完整或当前窗口标为 partial；没有把日志缺失补成零。软件包请求并非独立安装量。`});
    body+=table("cdn-series",rows,[dateColumn(key,grain==="monthly"?"月份":"日期"),col("requests","请求","number"),col("bytes","传输字节","bytes"),col("package_downloads","软件包 GET","number"),col("rpm_downloads","RPM GET","number"),col("deb_downloads","DEB GET","number"),col("core_downloads","核心包 GET","number"),...(grain==="monthly"||state.region!=="all"?[col("unique_ips",grain==="monthly"?"整月独立 IP":"区域日独立 IP","number")]:[]),partialColumn(grain==="monthly"?"is_partial_month":"is_partial_day")],{title:"CDN 软件分发趋势",note:"软件包总量涵盖核心、依赖与扩展；映射到扩展的成功请求另见扩展报告。区域和日期之间的独立 IP 不能直接相加。"});
    return section("软件仓库分发",`${SOURCE_NAMES.cdn} · ${grain==="monthly"?"两区域整月":"区域 "+state.region} · ${observedRange(rows,key)}。`,body,full?"":reportLink("cdn-traffic","仓库分发明细"));
  }
  function monthlyIPsSection() {
    const rows=filterPeriod(cdnRows("monthly"),"month"), yoy=latestComplete(cdnRows("monthly"),"unique_ips");
    const body=metricStrip([{label:"最近完整月独立 IP",value:yoy.row?.unique_ips,context:yoy.month?`${yoy.month} · 两区域整月去重`:"暂无完整月",delta:yoyDelta(yoy)},{label:"所选窗口月份",value:rows.length,context:observedRange(rows,"month")},{label:"所选窗口峰值月独立 IP",value:rows.length?Math.max(...rows.map(r=>number(r.unique_ips)||0)):null,context:"单月峰值，不跨月相加"}])+lineFigure("软件仓库 · 整月独立 IP",rows,"unique_ips",{key:"month",seriesLabel:"整月独立 IP",window:seriesMeta("cdn",rows,"month","两区域直接整月去重"),caption:"每月直接对源日志中的 client_ip 做去重，两区域统一范围；没有将日独立 IP、两个区域的 IP 或多个月的 IP 相加。partial 为不完整覆盖月。"})+table("cdn-monthly-ips",rows,[dateColumn("month","月份"),col("unique_ips","整月独立 IP","number"),col("requests","请求","number"),col("bytes","字节","bytes"),partialColumn("is_partial_month")],{title:"整月独立 IP",note:"IP 受共享出口、动态 IP 与自动化请求影响，不是用户 / 企业 / 客户数。"});
    return section("软件仓库月度覆盖",`原日志整月去重 · ${observedRange(rows,"month")} · Asia/Shanghai。`,body);
  }
  function nginxSection() {
    const all=list(payload("nginx").daily).filter(r=>r.site===state.nginxSite),grain=state.report==="nginx-sites"?resolveGrain(filterPeriod(all),true):"daily",key=grain==="monthly"?"month":"date",rows=filterPeriod(list(payload("nginx")[grain]).filter(r=>r.site===state.nginxSite),key);
    const site=list(payload("nginx").sites).find(s=>s.site===state.nginxSite)||{};
    let body=metricStrip([{label:"所选日志流请求",value:total(rows,"requests"),context:state.nginxSite||"暂无日志流"},{label:"所选日志流字节",formatted:bytes(total(rows,"bytes")),context:observedRange(rows,key)}])+lineFigure(`${state.nginxSite} · ${grain==="monthly"?"月":"日"}请求`,rows,"requests",{key,seriesLabel:"请求",window:`${observedRange(rows,key)} · 本流最近观测 ${date(site.last_day)} · 本流入库 ${stamp(site.captured_at)}`,caption:`每条日志流独立汇总；共享 access 日志不推断具体 hostname。${grain==="monthly"?"展示与所选日期区间重叠的整月源值，窗口覆盖按本日志流判断。":""} 缺失日志时段不代表没有访问；来源全局最新活动不替代所选流的入库时间。`})+table("nginx-series",rows,[dateColumn(key,grain==="monthly"?"月份":"日期"),col("site","日志流"),col("requests","请求","number"),col("bytes","字节","bytes"),col("unique_ips",grain==="monthly"?"整月独立 IP":"日独立 IP","number"),col("responses_4xx","4xx 请求","number"),col("responses_5xx","5xx 请求","number"),partialColumn(grain==="monthly"?"is_partial_month":"is_partial_day")],{title:"站点日志聚合",note:"请求和 IP 含自动化访问，不能当作 GA 活跃用户；不同站点 IP 不相加。"});
    return section("站点日志观察",`Nginx · 日志流 ${state.nginxSite||"未选择"} · ${observedRange(rows,key)}。`,body);
  }
  function dimensionsSection() {
    const d=payload("cdn"), rows=list(d.dimensions).filter(r=>r.dimension===state.dimension).sort((a,b)=>(b.successful_gets||0)-(a.successful_gets||0)),range=`${date(d.coverage?.dimension_start)} — ${date(d.coverage?.dimension_end)}`;
    return section("仓库系统与客户端",`近期维度窗口 ${range}；按源日志特征识别，无法识别的保留 unknown。`,barFigure({os:"操作系统",arch:"处理器架构",client:"请求客户端",delivery:"分发类型"}[state.dimension]+" · 成功 GET",rows,"value","successful_gets",`${SOURCE_NAMES.cdn} · ${range}。此维度是独立窗口累计，不受其他报告的月份选择影响。`)+table("cdn-dimensions",rows,[col("value","维度值","name"),col("successful_gets","成功 GET","number"),col("requests","全部请求","number"),col("bytes","传输字节","bytes")],{title:"仓库维度",note:"系统 / 客户端推断依赖 URL 和 User-Agent 分类；unknown 是未识别，不是一个操作系统。"}));
  }
  function packageRows() {
    return list(payload("cdn").dimensions).filter(r=>r.dimension==="package").filter(r=>state.packageMap==="all"||(state.packageMap==="mapped"?r.mapping_status==="mapped":r.mapping_status!=="mapped")).filter(r=>state.packageRepository==="all"||r.repository===state.packageRepository).filter(r=>state.packageFamily==="all"||r.family===state.packageFamily);
  }
  function packageGroup(rows,key) {
    const groups=new Map();
    for(const r of rows){const label=String(r[key]|| (key==="logical_pkg"||key==="primary_extension"||key==="category"?"未映射 / 未分类":"未注明"));if(!groups.has(label))groups.set(label,{name:label,requests:0,successful_gets:0,bytes:0,files:0,mapped_files:0,unmapped_files:0});const g=groups.get(label);g.requests+=number(r.requests)||0;g.successful_gets+=number(r.successful_gets)||0;g.bytes+=number(r.bytes)||0;g.files++;g[r.mapping_status==="mapped"?"mapped_files":"unmapped_files"]++;}
    return [...groups.values()].sort((a,b)=>b.successful_gets-a.successful_gets);
  }
  function extensionMonthlyRows(filtered) {
    const monthCoverage=new Map();
    for(const r of filtered){const prev=monthCoverage.get(r.month)||{};if(r.observed_start&&(!prev.observed_start||r.observed_start<prev.observed_start))prev.observed_start=r.observed_start;if(r.observed_end&&(!prev.observed_end||r.observed_end>prev.observed_end))prev.observed_end=r.observed_end;prev.hourly_coverage_status=r.hourly_coverage_status||prev.hourly_coverage_status;prev.unconfirmed_region_days=Math.max(prev.unconfirmed_region_days||0,number(r.unconfirmed_region_days)||0);monthCoverage.set(r.month,prev);}
    const rows=aggregate(filtered,"month",["requests","bytes","successful_gets"]).map(r=>({...r,...monthCoverage.get(r.month)}));
    return {rows, countKey: rows.some(r=>number(r.successful_gets)!==null)?"successful_gets":"requests"};
  }
  function extensionMonthlySection(opts = {}) {
    const d=payload("cdn"), raw=list(d.extension_monthly).filter(r=>state.packageRepository==="all"||r.repository===state.packageRepository).filter(r=>state.packageFamily==="all"||r.family===state.packageFamily);
    const {rows,countKey}=extensionMonthlyRows(filterPeriod(raw,"month"));
    let body;
    if(state.packageMap==="unmapped")body=empty("月度扩展表仅统计已映射包，不提供未映射包的扩展月趋势。");
    else if(!rows.length)body=empty("当前窗口暂无扩展映射包的月度拆分。仓库全部软件包月量保留在独立分发报告中，不作为扩展月量。");
    else body=lineFigure("扩展映射包 · 月度成功 GET",rows,countKey,{key:"month",seriesLabel:"扩展映射包 GET",window:seriesMeta("cdn",rows,"month",`映射包 · ${state.packageRepository} · ${state.packageFamily}`),caption:"仅统计能够映射到扩展的 RPM / DEB 成功 GET。月份、仓库路径与包格式筛选在月表内生效；日期窗口展示重叠的整月源值。近期排行与分类另按各自的观测窗口统计。重试或重复请求可能重复计数，partial 保留小时日志覆盖与当月未完标记。"})+(opts.summary?"":table("extension-monthly",rows,[dateColumn("month","月份"),col(countKey,"扩展映射包成功 GET","number"),col("bytes","字节","bytes"),dateColumn("observed_start","实际起始"),dateColumn("observed_end","实际截至"),partialColumn("is_partial_month"),col("hourly_coverage_status","小时覆盖","text",r=>r.hourly_coverage_status==="observed_24_hours_every_region_day"?"所有区域每日24小时已确认":"覆盖待确认",r=>r.hourly_coverage_status||"unknown")],{title:"扩展映射包月度汇总",note:`源记录截至 ${date(d.as_of)}。历史小时文件台账不完整的月份保留 partial；实际起止与每月完整性分别列出，不推断缺失请求量。`}));
    return section("扩展月度分发",`月度源表独立窗口；只使用明确映射的扩展包。`,body);
  }
  function packagesSection(kind=state.report) {
    const d=payload("cdn"), rows=packageRows(), groups=packageGroup(rows,state.packageGroup),range=`${date(d.coverage?.dimension_start)} — ${date(d.coverage?.dimension_end)}`,all=list(d.dimensions).filter(r=>r.dimension==="package"),mapped=all.filter(r=>r.mapping_status==="mapped"),unmapped=all.filter(r=>r.mapping_status!=="mapped");
    let body=metricStrip([{label:"近期扩展映射包 GET",value:total(mapped,"successful_gets"),context:`${range} · ${count(mapped.length)} 个发行文件`},{label:"近期未映射包 GET",value:total(unmapped,"successful_gets"),context:"可能含核心、依赖或尚未识别的扩展"},{label:"当前筛选成功 GET",value:total(rows,"successful_gets"),context:`${state.packageMap==="mapped"?"扩展映射包":state.packageMap==="unmapped"?"未映射包":"全部包"} · ${count(rows.length)} 个发行文件`},{label:"当前筛选传输量",formatted:bytes(total(rows,"bytes")),context:"发行文件窗口累计字节"}]);
    body+=notice(`包排行与维度的固定观测窗口为 ${range}。只有 mapping_status=mapped 才称为扩展映射包；未映射包保持独立。逻辑软件包和主扩展映射不是去重的扩展使用者，也不代表所有扩展均已识别。`);
    if(state.packageRepository!=="all"&&!all.some(r=>r.repository))body+=notice("该快照未提供仓库路径分类，当前路径筛选无记录；缺少分类时不作推断。","warning");
    body+=barFigure(`${state.packageMap==="mapped"?"扩展映射包":state.packageMap==="unmapped"?"未映射包":"发行包"} · 成功 GET 排行`,groups,"name","successful_gets",`近期窗口 ${range}。图中前 12 项，完整筛选结果在表格与 CSV 中。`);
    body+=table("extension-groups",groups,[col("name","当前聚合维度","name"),col("successful_gets","成功 GET","number"),col("bytes","字节","bytes"),col("files","发行文件","number"),col("mapped_files","已映射文件","number"),col("unmapped_files","未映射文件","number")],{title:"软件包聚合排行"});
    if(kind==="extension-package-rankings")body+=`<h3>发行文件明细</h3>`+table("extension-packages",[...rows].sort((a,b)=>b.successful_gets-a.successful_gets),[col("package","发行文件","name"),col("repository","仓库路径"),col("family","格式"),col("mapping_status","映射","text",r=>r.mapping_status==="mapped"?"扩展映射包":"未映射包"),col("logical_pkg","逻辑包","name"),col("category","类别"),col("primary_extension","主扩展映射","name"),col("successful_gets","成功 GET","number"),col("bytes","字节","bytes")],{title:"发行文件明细",note:"一个包可以关联多个扩展，主扩展字段是映射索引；不会将一份下载重复乘以扩展映射数量。"});
    return section(kind==="extension-package-dimensions"?"扩展映射与包维度":kind==="extension-package-rankings"?"扩展排行与分类":"扩展映射包观察",`腾讯 CDN · 独立近期维度窗口 ${range}；筛选在此窗口内生效。`,body);
  }

  const EVENT_NAMES={equity_financing:"股权融资",acquisition_announced:"收购宣布",acquisition_closed:"收购交割",team_integration:"团队加入",debt_credit:"债务 / 信贷",non_equity_support:"非股权支持",secondary_transaction:"二级交易",funding_aggregate:"融资累计",unclassified:"未分类"};
  const eventName = (e) => e.event_type === "acquisition_closed" && e.closed_date_basis === "confirmation_announcement" ? "收购完成确认" : EVENT_NAMES[e.event_type] || e.event_type;
  const scopeName = (value) => value==="pg"?"PostgreSQL":"相邻生态";
  const eventDate = (e) => e.announced_date || e.closed_date || e.date_label || "日期待确认";
  function eventSources(e) {
    const sourceMap=new Map(list(payload("industry").sources).map(s=>[s.id,s]));
    return list(e.source_ids).map(id=>sourceMap.get(id)).filter(s=>s&&safeURL(s.url));
  }
  function evidenceLinks(e,limit=3) { return eventSources(e).slice(0,limit).map((s,i)=>link(s.source_grade==="A"?`官方来源 ${i+1}`:`证据 ${i+1}`,s.url)).join(" "); }
  function evidenceCell(e) {
    const excerpt=e.evidence_excerpt||e.title||"此项未提供公开摘录。";
    return `<details><summary>查看证据${eventSources(e).length?"（"+eventSources(e).length+"）":""}</summary><p>${esc(publicText(excerpt))}</p>${e.caveat?`<p>${esc(publicText(e.caveat))}</p>`:""}<div>${evidenceLinks(e,8)}</div></details>`;
  }
  function industryEvents(status=state.industryStatus) {
    let rows=list(payload("industry").events);
    rows=[...rows,...list(payload("industry").candidates)];
    rows=rows.filter(e=>status==="all"||e.verification_status===status).filter(e=>state.industryScope==="all"||e.scope===state.industryScope).filter(e=>state.industryType==="all"||e.event_type===state.industryType).filter(e=>state.industryCompany==="all"||e.company_id===state.industryCompany);
    return rows.sort((a,b)=>String(b.announced_date||b.closed_date||"").localeCompare(String(a.announced_date||a.closed_date||"")));
  }
  function eventTable(key,events) {
    return table(key,events,[col("announced_date","事件日（优先宣布）","text",e=>esc(eventDate(e)),eventDate),col("closed_date","独立交割日","text",e=>e.closed_date_basis==="confirmation_announcement"?"未披露（公告确认完成）":esc(date(e.closed_date)),e=>e.closed_date_basis==="confirmation_announcement"?"":e.closed_date||""),col("company_name","公司","name"),col("scope","范围","text",e=>scopeName(e.scope),e=>scopeName(e.scope)),col("event_type","事件类型","text",e=>esc(eventName(e)),eventName),col("round","轮次 / 对方","name",e=>esc([e.round,e.buyer,list(e.investors).join("、")].filter(Boolean).join(" · ")||"未注明"),e=>[e.round,e.buyer,list(e.investors).join("、")].filter(Boolean).join(" · ")),col("amount_usd","融资 / 交易金额","text",e=>esc(money(e.amount_usd)),e=>e.amount_usd??""),col("valuation_usd","估值（独立）","text",e=>`${esc(money(e.valuation_usd))}${e.valuation_usd?`<div class="muted">${esc(({pre_money:"投前",post_money:"投后",unspecified:"基础未确认"})[e.valuation_basis]||"基础未确认")}</div>`:""}`,e=>e.valuation_usd??""),col("verification_status","核实状态","text",e=>badge(e.verification_status)),col("evidence_excerpt","公开证据","evidence",evidenceCell,e=>e.evidence_excerpt||e.title||""),col("source_ids","证据链接","text",e=>`<div class="source-links">${evidenceLinks(e)}</div>`,e=>eventSources(e).map(s=>s.url).join(" "))],{title:"行业事件",note:"USD 为原金额单位；金额为空表示未披露或尚未确认。历史融资累计、债务、估值与收购对价不合并成融资额；宣布日、完成确认公告与独立法律交割日分别记录。"});
  }
  /* Verified events per year, split by type, so the capital cycle is visible at a glance. */
  function industryYearFigure(events) {
    const years=new Map();
    for(const e of events){const y=String(eventDate(e)).slice(0,4);if(!/^\d{4}$/.test(y))continue;const g=years.get(y)||{year:y,financing:0,acquisition:0,other:0};if(e.event_type==="equity_financing")g.financing++;else if(String(e.event_type).startsWith("acquisition"))g.acquisition++;else g.other++;years.set(y,g);}
    const ys=[...years.keys()].map(Number);if(ys.length<2)return "";
    for(let y=Math.min(...ys);y<=Math.max(...ys);y++)if(!years.has(String(y)))years.set(String(y),{year:String(y),financing:0,acquisition:0,other:0});
    const rows=[...years.values()].sort((a,b)=>a.year.localeCompare(b.year));
    const max=Math.max(...rows.map(r=>r.financing+r.acquisition+r.other))||1;
    const bars=rows.map(r=>{const t=r.financing+r.acquisition+r.other;return `<li><span class="bar-label">${esc(r.year)}</span><span class="bar-track stack" aria-hidden="true"><span class="bar-fill" style="width:${(r.financing/max*100).toFixed(2)}%"></span><span class="bar-fill acq" style="width:${(r.acquisition/max*100).toFixed(2)}%"></span><span class="bar-fill other" style="width:${(r.other/max*100).toFixed(2)}%"></span></span><span class="bar-value">${t}<small>融资 ${r.financing} · 收购 ${r.acquisition}</small></span></li>`;}).join("");
    return `<figure class="figure"><div class="figure-head"><div class="figure-heading"><div class="figure-title">已核实事件 · 按年份</div><div class="figure-window">按事件日（优先宣布日）归年 · 当前筛选范围</div></div></div><div class="legend" style="margin:0 0 10px"><span class="lg">股权融资</span><span class="lg" style="--chart-line:var(--amber-500)">收购宣布 / 交割</span><span class="lg" style="--chart-line:var(--slate-300)">团队加入 / 其他</span></div><ol class="bars years">${bars}</ol><figcaption>事件计数，不代表金额规模；一家公司的宣布与交割分别计为两条已核实记录。</figcaption></figure>`;
  }
  function industrySection(full=false) {
    const d=payload("industry"),allVerified=list(d.events).filter(e=>e.verification_status==="verified"),events=full?industryEvents():industryEvents("verified");
    const status=full?state.industryStatus:"verified";
    const financing=events.filter(e=>e.verification_status==="verified"&&e.event_type==="equity_financing"&&number(e.amount_usd)!==null),moneySum=total(financing,"amount_usd");
    let body=metricStrip([{label:"公开公司样本",value:list(d.companies).length,context:"PG 公司与相邻数据库 / 工具分别标记"},{label:"已核实事件",value:allVerified.length,context:`截至 ${date(d.as_of)} · 公开原文核验`},{label:"所选已核实股权轮次",value:financing.length,context:"仅金额已确认的股权融资事件"},{label:"所选股权轮次公告金额",formatted:moneySum===null?"—":money(moneySum),context:"多轮公告规模之和，不是净新增现金"}]);
    if(full&&(status==="verified"||status==="all"))body+=industryYearFigure(events.filter(e=>e.verification_status==="verified"));
    if(!full||status==="verified"||status==="all")body+=`<ol class="timeline">${events.filter(e=>e.verification_status==="verified").slice(0,full?16:8).map(e=>`<li><time class="timeline-date">${esc(eventDate(e))}</time><div><h3>${esc(e.company_name||e.company_id)}<span class="event-type">${esc(eventName(e))}</span><span class="scope-tag">${esc(scopeName(e.scope))}</span></h3><p>${esc(publicText(e.title||e.evidence_excerpt||""))}${e.buyer?" · 对方："+esc(e.buyer):""}</p>${e.amount_usd!==null&&e.amount_usd!==undefined?`<div class="amount">${esc(money(e.amount_usd))}${e.valuation_usd?" · 估值 "+esc(money(e.valuation_usd)):""}</div>`:""}${e.caveat?`<p>${esc(publicText(e.caveat))}</p>`:""}<div class="source-links">${evidenceLinks(e)}</div></div></li>`).join("")}</ol>`;
    if(status==="legacy")body+=notice(`历史研究基准 ${d.provenance?.baseline_as_of||"2026-08-28"}。此列表保留原研究结论，不能解释为本轮重新核实；旧累计金额或估算不进入最新融资合计。`,"warning");
    const pending=list(d.candidates).length;
    if(full&&status==="verified"&&pending)body+=notice(`另有 ${count(pending)} 条自动发现的待核实线索，未计入以上计数与金额；可在「核实状态 · 待核实线索」中单独查看。`);
    if(status==="candidate")body+=notice("待核实线索供后续研究使用。自动发现并不等于事实成立，这些条目不进入正文、已核实计数或金额合计。","warning");
    if(full) {
      body+=`<h3>事件明细</h3>`+eventTable("industry-events",events);
      const visibleCompanies=list(d.companies).filter(c=>state.industryScope==="all"||c.scope===state.industryScope).filter(c=>state.industryCompany==="all"||c.id===state.industryCompany);
      const coverage=new Map(list(d.coverage).map(c=>[c.company_id,c]));
      const companyRows=visibleCompanies.map(c=>({...c,events:list(d.events).filter(e=>e.company_id===c.id).length,verified_events:allVerified.filter(e=>e.company_id===c.id).length,checked_status:coverage.get(c.id)?.status||"历史样本"}));
      body+=`<h3>公司样本与定位</h3>`+table("industry-companies",companyRows,[col("name","公司","name",c=>link(c.name,c.website)),col("scope","范围","text",c=>scopeName(c.scope),c=>scopeName(c.scope)),col("layer","领域","name"),col("description","公开定位","long"),col("events","事件记录","number"),col("verified_events","已核实","number"),col("checked_status","本轮覆盖","text",c=>esc(({checked:"已检查",failed:"检查失败",not_refreshed:"尚未检查"})[c.checked_status]||c.checked_status))],{title:"行业公司样本",note:"历史公司清单与公司最新融资不是同一时间点；公司存在于样本中不表示每个旧事件已完成当前核验。"});
      if(status!=="legacy"&&status!=="all")body+=`<details class="appendix"><summary>历史研究附录 · ${list(d.events).filter(e=>e.verification_status==="legacy").length} 条（原研究基准 ${esc(d.provenance?.baseline_as_of||"2026-08-28")}）</summary><div>${eventTable("industry-legacy",industryEvents("legacy"))}</div></details>`;
    } else body+=`<div class="inline-links">${reportLink("industry","事件证据与公司清单")}</div>`;
    return section("PostgreSQL 与相邻生态的资本事件",`已核实的融资、收购与团队加入分别记录；PGlite / ElectricSQL 属 PostgreSQL 生态，Cursor 等开发工具明确列作相邻案例。`,body);
  }

  function archiveContent() {
    const a=DATA.archives?.[state.report]||{},sections=list(a.sections),index=Math.max(0,Math.min(Number(state.archiveSection)||0,sections.length-1)),selected=sections[index],files=list(a.provenance);
    let body=notice("这是一份固定历史专题的证据重建。原始观察日期与估算口径保留；本次页面生成不代表数据重新采集或估算已重新验证。","warning");
    body+=`<div class="archive-meta"><span>原制品日期：<strong>${esc(a.as_of?date(a.as_of):"原文件未注明统一日期")}</strong></span><span>历史表格：<strong>${count(sections.length)}</strong></span><span>原始制品：<strong>${count(files.length)}</strong></span></div>`;
    if(sections.length){body+=`<div class="toolbar static">${field("archiveSection","历史 CSV",sections.map((s,i)=>[String(i),s.title]),true)}<span class="toolbar-hint">每张历史 CSV 最多重建 2,000 行；原始材料保留。</span></div>`;
      const columns=list(selected.columns).map(key=>col(key,key,list(selected.rows).some(r=>typeof r[key]==="number")?"number":"text"));
      body+=section(selected.title,"按原历史 CSV 重建，日期与估算标签保留。",table("archive-table",list(selected.rows),columns,{title:selected.title,note:"下载的是当前重建与筛选的数据。大型原 CSV 最多呈现前 2,000 行，文件哈希用于核对原始制品，不将截断样本当作完整底表。"}));
    } else body+=empty("该专题没有可重建的 CSV 表格；原 HTML / PDF / Markdown 制品见下方证据索引。");
    body+=section("原始制品与证据索引","保留制品名、大小与 SHA-256；日期从原文件名提取，未注明的保持未确认。",`<ul class="provenance-list">${files.map(f=>`<li><strong>${esc(f.name)}</strong><span class="quiet"> · ${esc(bytes(f.bytes))}</span><span class="hash">SHA-256 ${esc(f.sha256||"未计算（大型制品）")}</span></li>`).join("")||"<li>尚无原制品索引。</li>"}</ul>`);
    body+=section("后续观察入口","当前数据见以下报告；历史结论不以新日期重新标注。",`<div class="inline-links">${(reportDef().sources||[]).filter(s=>s!=="industry").map(s=>reportLink(({cdn:"cdn-traffic",nginx:"nginx-sites"})[s]||s)).join("")}</div>`);
    return body;
  }

  /* ---------- Overview chapters ---------- */
  function summarySection() {
    const gh=payload("github"),docker=payload("dockerhub"),cdn=payload("cdn"),s=selectedSite();
    const ga=latestComplete(gaRows("monthly"),"uv"), pkg=latestComplete(cdnRows("monthly"),"package_downloads");
    const year=String(payload("ga").yearly_meta?.as_of||"").slice(0,4);
    const annual=(allGASites()?list(payload("ga").aggregate?.yearly):list(payload("ga").yearly).filter(r=>String(r.site_id)===String(s.site_id))).find(r=>r.year.slice(0,4)===year);
    const silo=siloProject(), quarter=GROWTH.distribution?.latest_quarter;
    const items=[
      {label:gaMonthlyLabel("活跃用户"),value:ga.row?.uv,delta:yoyDelta(ga),secondary:momDelta(gaRows("monthly"),"uv"),context:`GA · ${ga.month||"暂无完整月"} · ${gaScope()}`},
      {label:"Silo 项目累计拉取",value:silo.pulls,formatted:short(silo.pulls),delta:projectDelta(silo),context:`pgsty/minio + pgsty/silo · ${date(docker.as_of)}`},
      {label:allGASites()?"年内活跃访客合计":"单站年内活跃访客",value:annual?.uv,delta:annualDelta(annual),context:`${date(annual?.window_start)} — ${date(annual?.window_end)} · ${allGASites()?"跨站未去重 · 统计覆盖会变化":"单站直接年度查询"}`},
      {label:"公开组织 Stars",value:gh.totals?.stars,delta:snapDelta(gh.delta?.same_repository_stars,gh.delta?.baseline_captured_at,gh.as_of,"同仓库"),context:`GitHub · ${date(gh.as_of)} · ${count(gh.totals?.repositories)} 个公开仓库`},
      {label:"整月软件包获取请求",value:pkg.row?.package_downloads,delta:yoyDelta(pkg),secondary:momDelta(cdnRows("monthly"),"package_downloads"),context:`${pkg.month||"暂无完整月"} · RPM / DEB · 成功获取请求`},
      {label:"最近完整季度软件包获取",value:quarter?.package_downloads,formatted:short(quarter?.package_downloads),delta:changeDelta(quarter?.yoy,"同比去年同季度"),context:quarter?`${quarter.quarter} · ${quarter.window_start} — ${quarter.window_end}`:"暂无完整季度记录"}
    ];
    return section("规模与增长","受众、社区关注与软件获取，按各自的时间范围观察增长。",metricStrip(items,"hero-stats")+`<p class="method">${esc("全站受众相加且统计覆盖会变化；固定站点同比见下方。拉取与获取请求含重复访问，分别保留原单位。")}</p>`);
  }
  function productSection() {
    const gh=payload("github"), pigsty=list(gh.repositories).find(r=>r.full_name==="pgsty/pigsty")||{}, silo=siloProject(), anchor=GROWTH.ga?.pigsty_cc?.current;
    const pigstyBody=`<article class="product-evidence" data-product="pigsty"><header><h3>${link("Pigsty",pigsty.url||"https://github.com/pgsty/pigsty")}</h3><p>${esc("PostgreSQL 数据库基础设施")}</p></header><dl><div><dt>${esc("主仓库 Stars")}</dt><dd>${count(pigsty.stars)}</dd><small>GitHub · ${date(gh.as_of)}</small></div><div><dt>${esc("中文站年内活跃访客")}</dt><dd>${short(anchor?.uv)}</dd>${deltaHTML(annualDelta(anchor))}<small>pigsty.cc · ${date(anchor?.window_end)}</small></div></dl><p class="method">${esc("同一站点、同一年度截止日期直接查询；网站访问体现文档与产品传播。")}</p></article>`;
    const siloBody=`<article class="product-evidence" data-product="silo"><header><h3>${link("Silo",silo.url||"https://silo.pgsty.com/")}</h3><p>${esc("两个镜像仓库，同一个项目")}</p></header><dl><div><dt>${esc("项目累计镜像拉取")}</dt><dd>${short(silo.pulls)}</dd><small>Docker Hub · ${date(silo.as_of)}</small></div><div><dt>${esc("主仓库 Stars")}</dt><dd>${count(silo.stars)}</dd><small>GitHub · ${date(gh.as_of)}</small></div></dl><ul class="project-members">${list(silo.members).map(r=>`<li>${link(`pgsty/${r.name}`,r.url)}<strong>${count(r.pulls)}</strong></li>`).join("")}</ul><p class="method">${esc("Silo 合计两个仓库的累计计数；mc 独立列示，项目合计不重复加到组织总量。")}</p></article>`;
    return section("产品增长","把生态规模落实到具体项目；每项证据保留自己的来源与单位。",`<div class="product-grid">${pigstyBody}${siloBody}</div>`);
  }
  function longRunSection() {
    const cols=gridCols(2), s=selectedSite(), gaM=gaRows("monthly"), cdnM=cdnRows("monthly"), silo=siloProject();
    const base={key:"month",compact:true,cols};
    const figs=[
      lineFigure(`${gaName(s)} · 整月活跃用户`,gaM,"uv",{...base,seriesLabel:"整月活跃用户",window:`GA · ${observedRange(gaM,"month")}`,caption:allGASites()?"各站点整月活跃用户相加，跨站未去重；不由日活累加。历史站点范围随观测覆盖变化。":"每月直接查询整月活跃用户，不由日活累加；单站口径。"}),
      lineFigure("软件包 · 整月成功 GET",cdnM,"package_downloads",{...base,seriesLabel:"软件包成功 GET",window:`CDN · ${observedRange(cdnM,"month")}`,caption:"RPM / DEB 成功 GET，含重试与重复分发，非安装量。"}),
      starStackFigure({compact:true,cols,title:"全部仓库 · 现存 Stars 堆叠",caption:"GitHub 现存 Stars 历史按月累计后堆叠；当前月截至采集日，不含已取消的 Stars。"})||retainedStarFigure({compact:true,cols}),
      lineFigure("Silo · 累计镜像拉取",list(silo.history),"pulls",{compact:true,cols,snapshots:true,height:420,seriesLabel:"累计拉取",window:`Docker Hub · ${observedRange(list(silo.history))}`,caption:"pgsty/minio + pgsty/silo；仅使用有仓库明细的真实快照，不插值为逐日新增，历史缺口保持为空。"})
    ];
    return section("长期趋势 · 完整历史","不受观察窗口影响，始终展示各来源的全部可得历史；月度图使用源月表，部分月以空心点标出。悬停查看具体数值。",chartGrid(figs,cols));
  }
  function ecosystemSummary() {
    const ext=GROWTH.distribution?.extensions||{}, quarter=GROWTH.distribution?.latest_quarter;
    let body=metricStrip([{label:"有获取记录的扩展包",value:ext.active_logical_packages,context:`${String(ext.month||"—").slice(0,7)} · 逻辑包去重 · ${ext.status==="complete"?"完整月":"暂无完整月"}`},{label:"整月扩展包获取请求",value:ext.successful_gets,formatted:short(ext.successful_gets),context:"仅统计已明确映射到扩展的成功请求"}]);
    body+=`<p class="method">${esc("扩展包数量按逻辑包去重；获取次数包含重试与重复获取，不代表安装数。")}</p><div class="inline-links">${["extension-downloads","extension-monthly","extension-package-rankings","distribution"].map(id=>reportLink(id)).join("")}</div>`;
    const quarters=list(GROWTH.distribution?.quarters).filter(r=>r.month.slice(0,4)>=String(Number(quarter?.month?.slice(0,4)||0)-1));
    body+=table("distribution-quarters",quarters,[col("quarter","季度"),col("package_downloads","完整季度成功获取请求","number"),col("observed_package_downloads","已观测获取请求","number"),col("status","覆盖","text",r=>badge(r.status)),col("yoy","同比","percent")],{title:"季度软件分发",note:"完整季度需要三个完整月份；有日志缺口的季度只保留已观测请求，完整季度值与同比保持为空。"});
    return section("软件与扩展需求","用完整季度看分发规模，用整月逻辑包看生态覆盖。",body);
  }
  function overview() {
    const details=["ga","github","dockerhub","cdn-traffic","repo-monthly-uv","cloudflare-daily","nginx-sites",...(state.report!=="pigsty-growth"?["industry"]:[])];
    return summarySection()+productSection()+gaGrowthSection()+longRunSection()+ecosystemSummary()+section("进一步查看","完整表格、技术访问统计与行业研究保留在各自报告中。",`<div class="inline-links">${details.map(id=>reportLink(id)).join("")}</div>`);
  }
  function content() {
    const id=state.report,def=reportDef();let html="";
    if(def.kind==="archive")return archiveContent();
    if(OVERVIEW_REPORTS.includes(id))html=overview();
    else if(id==="industry")html=industrySection(true);
    else if(id==="github")html=githubSection(true);
    else if(id==="dockerhub")html=dockerSection(true);
    else if(id==="open-source")html=comparisonSection()+githubSection(false)+dockerSection(false);
    else if(id==="ga")html=gaSection(true);
    else if(id.startsWith("cloudflare"))html=cfSection(true);
    else if(id==="cdn-traffic")html=cdnSection(true);
    else if(id==="nginx-sites")html=nginxSection();
    else if(id==="distribution")html=cdnSection(false)+githubSection(false)+dockerSection(false)+cfSection(false);
    else if(id==="traffic-observation")html=gaSection(false)+cfSection(false)+nginxSection();
    else if(id==="repo-system-distribution")html=dimensionsSection();
    else if(id==="repo-monthly-uv")html=monthlyIPsSection();
    else if(id==="extension-monthly")html=extensionMonthlySection();
    else if(id==="extension-downloads")html=extensionMonthlySection({summary:true})+packagesSection(id);
    else if(id==="extension-package-rankings")html=packagesSection(id);
    else html=empty("此报告尚无可展示的数据。");
    return html+sourceSection();
  }
  function intro() {
    const def=reportDef(), id=state.report;
    const descriptions={
      operations:"Pigsty 与 Silo 的公开进展：受众、社区和软件分发，按产品与同一站点范围观察增长。",
      industry:"沿着公司、时间与公开原文梳理 PostgreSQL 产业的融资、收购和团队整合。原历史研究保留为附录，自动发现的候选单独等待核实。",
      github:"公开仓库、关注、复用与版本资产的可追溯快照。累计计数与同一仓库 / 资产的变化分别呈现，保留范围扩大与仓库迁移的影响。",
      dockerhub:"按项目与镜像阅读分发规模。Silo 合计 pgsty/minio 和 pgsty/silo，两项原始计数与实际历史快照保留，可核对、可导出。",
      "open-source":"在明确的公开项目样本中观察 Pigsty 的开源关注。同行仓库按原样本与当前 canonical 名称对应，镜像分发单列。",
      ga:"默认合计全部 GA 站点，也可切换单站 / Property。整月活跃用户相加各站整月查询值，跨站未去重；不累加日活。",
      "cloudflare-ytd":"观察账号在年内的边缘请求、HTML 浏览与日独立 IP。完整日与部分日分开，原始峰值及 overview 缺口保留。",
      "repo-monthly-uv":"在完整月份范围直接去重源日志中的 IP，观察软件仓库的覆盖变化。月独立 IP 与每日、区域计数分开。",
      "extension-monthly":"按月观察明确映射到扩展的软件包成功分发。映射范围、小时覆盖与当月未完成状态直接标明。",
      "repo-system-distribution":"在近期日志窗口观察软件仓库的操作系统、架构、请求客户端与分发类型。未识别的特征保留 unknown。",
      distribution:"分别观察 GitHub 发行资产、Docker 镜像、CDN 软件包与 Cloudflare 边缘请求。来源有各自的时间范围，不合并为一个安装或用户数。",
      "traffic-observation":"将全部站点 GA 受众合计、Cloudflare 账号边缘请求与单条 Nginx 日志流并列阅读。差异来自覆盖与机制，不能相减推算访客构成。",
      "pigsty-growth":"从社区关注、网站传播与软件分发观察产品增长。快照变化与访问时间窗口分别呈现，各来源保留原单位。"
    };
    const lede=descriptions[id]|| (def.kind==="archive"?"从原始报告与 CSV 重建这一专题的历史证据。原观察窗口、估算标签与制品哈希保留，方便后续复核和独立更新。":id.startsWith("extension-")?"观察扩展映射的软件包分发、排名与维度。未映射包另列，映射到一个软件包不等于一个独立使用者。":id.startsWith("cloudflare")?"连续观察账号级边缘请求与页面响应，保留 core / overview 的独立覆盖、部分日和异常峰值。":"保留来源、时间窗口与数据口径的公开聚合观察。趋势与完整表格使用同一份数据。");
    const isOverview=OVERVIEW_REPORTS.includes(id);
    const title=def.title, sources=(def.sources||[]).filter(s=>!isOverview||["ga","github","dockerhub","cdn"].includes(s));
    const chips=sources.map(s=>{const st=list(DATA.sources).find(x=>x.id===s)||{},d=payload(s);return `<span class="source-chip ${esc(st.status||"unknown")}" title="${esc(`${SOURCE_NAMES[s]||s} · ${STATUS_NAMES[st.status]||"待确认"} · 源记录截至 ${date(d.as_of)}`)}"><span class="dot" aria-hidden="true"></span>${esc(SOURCE_SHORT[s]||s)}<span class="chip-date">${esc(d.as_of?date(d.as_of).slice(5):"—")}</span><span class="sr-only">${esc(STATUS_NAMES[st.status]||"待确认")}</span></span>`;}).join("");
    const eyebrow=def.kind==="archive"?"历史研究档案":"公开指标";
    return `<header class="hero">${isOverview?"":`<span class="eyebrow${def.kind==="archive"?" archive":""}">${esc(eyebrow)}</span>`}<h1>${esc(title)}</h1><p class="lede">${esc(lede)}</p><div class="hero-meta"><span class="source-chips" aria-label="数据来源与新鲜度">${chips}</span><span><span class="meta-label">页面生成</span>${stamp(DATA.meta?.generated_at)}</span>${isOverview?"":'<span><span class="meta-label">口径</span>图表与 CSV 使用同一份公开数据</span>'}</div>${!isOverview&&toc.length>=3?`<nav class="toc" aria-label="本页章节">${toc.map(t=>`<a href="#${t.id}" data-jump="${t.id}"><span>${t.n}</span>${esc(t.title)}</a>`).join("")}</nav>`:""}</header>`;
  }
  function navigation() {
    $("report-count").textContent=GROUPS.reduce((n,[,ids])=>n+ids.filter(id=>CATALOG.some(r=>r.id===id)).length,0);
    $("report-nav").innerHTML=GROUPS.map(([name,ids])=>`<div class="nav-group"><h3>${esc(name)}</h3>${ids.map(id=>{const r=CATALOG.find(x=>x.id===id);return r?`<a href="${esc(reportHref(id))}" data-report-link="${esc(id)}"${id===state.report?' aria-current="page"':""}>${esc(r.title)}${r.kind==="archive"?'<span class="nav-kind">历史</span>':""}</a>`:"";}).join("")}</div>`).join("");
    $("report-select").innerHTML=GROUPS.map(([name,ids])=>`<optgroup label="${esc(name)}">${ids.map(id=>CATALOG.find(r=>r.id===id)).filter(Boolean).map(r=>option(r.id,r.title,state.report)).join("")}</optgroup>`).join("");
    $("edition").textContent=t(`数据刊物 · ${publicationDay()}`);
    I18N?.localize($("report-nav"));
    I18N?.localize($("report-select"));
    syncLanguageLinks();
  }
  function render(preserveFocus=false) {
    const active=preserveFocus?document.activeElement:null,focusKey=active?.dataset?.search,controlKey=active?.dataset?.control,pageKey=active?.dataset?.page,pageStep=active?.dataset?.step,setKey=active?.dataset?.set,setValue=active?.dataset?.value,selection=active?.selectionStart;
    // The currently displayed links stay valid until their table is redrawn.
    for(const url of downloadURLs) URL.revokeObjectURL(url);
    downloadURLs.clear();
    tables.clear();charts.clear();toc.length=0;sectionNumber=0;chartSeq=0;
    const main=content();
    $("report-content").classList.toggle("is-overview",OVERVIEW_REPORTS.includes(state.report));
    $("report-content").innerHTML=intro()+toolbar()+main;
    $("report-content").setAttribute("aria-busy","false");
    I18N?.localize($("report-content"));
    bindCharts();
    updateHash();
    document.title=t(`${reportDef().title} · Pigsty 公开指标`);navigation();
    if(focusKey){const element=[...document.querySelectorAll("[data-search]")].find(el=>el.dataset.search===focusKey);if(element){element.focus({preventScroll:true});try{element.setSelectionRange(selection,selection);}catch(_){}}}
    else if(controlKey){const element=[...document.querySelectorAll("[data-control]")].find(el=>el.dataset.control===controlKey);element?.focus({preventScroll:true});}
    else if(setKey){const element=[...document.querySelectorAll("[data-set]")].find(el=>el.dataset.set===setKey&&el.dataset.value===setValue);element?.focus({preventScroll:true});}
    else if(pageKey){const element=[...document.querySelectorAll("[data-page]")].find(el=>el.dataset.page===pageKey&&el.dataset.step===pageStep&&!el.disabled);element?.focus({preventScroll:true});}
  }
  // Only public, bounded filter values travel with a bilingual deep link.
  const HASH_KEYS = ["period","gaSite","nginxSite","gaMetric","cfMetric","cdnMetric","grain","region","scale","compareGroup","githubMetric","githubRepo","dockerRepo","industryStatus","industryScope","industryType","industryCompany","packageMap","packageRepository","packageFamily","packageGroup","dimension"];
  function syncLanguageLinks() {
    for (const anchor of document.querySelectorAll("[data-lang-switch],.portal-lang__trigger,a[hreflang]")) {
      const url = new URL(anchor.getAttribute("href"),location.href);
      if (url.origin !== location.origin) continue;
      url.hash = location.hash;
      anchor.href = url.href;
    }
  }
  function updateHash() {
    const params=new URLSearchParams({report:state.report});
    for (const key of HASH_KEYS) {
      const baseline = key === "period" ? defaultPeriod(state.report) : key === "packageGroup" && PACKAGE_DEFAULTS[state.report] ? PACKAGE_DEFAULTS[state.report] : key === "cfMetric" && state.report === "cloudflare-daily" ? "requests" : FILTER_DEFAULTS[key];
      if (String(state[key]) !== String(baseline)) params.set(key,String(state[key]));
    }
    const next="#"+params.toString();
    try{history.replaceState(null,"",next);}catch(_){location.hash=next;}
  }
  function choosePeriod(id) {
    const fixed=["cloudflare-ytd","repo-monthly-uv","extension-monthly"].includes(id);
    state.period=!fixed&&userPeriod?userPeriod:defaultPeriod(id);
  }
  function chooseReport(id) {
    if(!CATALOG.some(r=>r.id===id))return;
    clearTimeout(searchTimer);
    state.report=id;state.pages={};state.archiveSection="0";
    choosePeriod(id);
    if(id==="cloudflare-daily")state.cfMetric="requests";
    if(PACKAGE_DEFAULTS[id])state.packageGroup=PACKAGE_DEFAULTS[id];
    updateHash();render();$("main-content").focus({preventScroll:true});window.scrollTo({top:0,behavior:"auto"});
  }
  function readHash() {
    const params=new URLSearchParams(location.hash.replace(/^#/,"")),raw=params.get("report"),id=RETIRED[raw]||raw;
    const before=state.report;
    if(id&&CATALOG.some(r=>r.id===id))state.report=id;
    if(before!==state.report)choosePeriod(state.report);
    for (const key of HASH_KEYS) {
      const value=params.get(key);
      if (value !== null && value.length <= 200 && !/[<>\x00-\x1f]/.test(value)) state[key]=value;
    }
    if (params.has("period")) userPeriod=state.period;
    if (!params.has("cfMetric") && state.report === "cloudflare-daily") state.cfMetric="requests";
    if (!params.has("packageGroup") && PACKAGE_DEFAULTS[state.report]) state.packageGroup=PACKAGE_DEFAULTS[state.report];
    if(raw&&(RETIRED[raw]||params.has("view")))updateHash();
  }
  document.addEventListener("click",(event)=>{
    const target=event.target.closest("[data-report-link],[data-export],button[data-page],button[data-set],[data-jump]");if(!target)return;
    if(target.dataset.reportLink){if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();chooseReport(target.dataset.reportLink);}
    else if(target.dataset.export)$("announcer").textContent=t(`已请求下载 ${target.dataset.rowCount || "全部"} 条筛选记录。`);
    else if(target.dataset.page){state.pages[target.dataset.page]=(state.pages[target.dataset.page]||1)+Number(target.dataset.step);render(true);}
    else if(target.dataset.set&&Object.hasOwn(state,target.dataset.set)){state[target.dataset.set]=target.dataset.value;if(target.dataset.set==="period")userPeriod=state.period;state.pages={};render(true);}
    else if(target.dataset.jump){event.preventDefault();const el=$(target.dataset.jump);if(el){el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});el.querySelector("h2")?.setAttribute("tabindex","-1");el.querySelector("h2")?.focus({preventScroll:true});}}
  });
  document.addEventListener("change",(event)=>{
    const target=event.target;
    if(target.id==="report-select")chooseReport(target.value);
    else if(target.dataset.control&&Object.hasOwn(state,target.dataset.control)){if(target.dataset.control==="period"){if(!target.value)return;userPeriod=target.value;}state[target.dataset.control]=target.value;state.pages={};render(true);}
  });
  document.addEventListener("toggle",(event)=>{const key=event.target?.dataset?.tableKey;if(key){if(event.target.open)openTables.add(key);else openTables.delete(key);}},true);
  let searchTimer=null;
  document.addEventListener("input",(event)=>{
    const key=event.target.dataset.search;if(!key)return;const value=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{state.searches[key]=value;state.pages[key]=1;render(true);},180);
  });
  window.addEventListener("hashchange",()=>{if(!/report=/.test(location.hash))return;readHash();render();});
  let resizeTimer=null,lastWidth=window.innerWidth;window.addEventListener("resize",()=>{if(Math.abs(window.innerWidth-lastWidth)<24)return;lastWidth=window.innerWidth;clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>render(true),150);});
  I18N?.localize(document.querySelector(".repoort-app") || document.body);
  if (document.body.dataset.manifest) {
    const download = document.getElementById("public-data-download");
    if (download) {
      download.href=URL.createObjectURL(new Blob([JSON.stringify(DATA)],{type:"application/json"}));
      download.download=`pigsty-report-${DATA.meta?.snapshot_id || "snapshot"}.json`;
    }
  }
  readHash();render();
}).catch(error => {
  const node=document.getElementById("report-content");
  if (node) { node.textContent=document.documentElement.lang.startsWith("en") ? "The report could not load. Please reload the page. The published snapshot has not changed." : "报告加载失败，请刷新页面重试。已发布的数据快照保持不变。"; node.setAttribute("aria-busy","false"); }
  console.error("Repoort could not load:",error);
});
