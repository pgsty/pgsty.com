# pgsty.com v3 实施方案 —— 用 OINK 0.5 落地 Percona 式站点结构

| 项目 | 内容 |
|---|---|
| 版本 | 2026-08-18 |
| 上游文档 | `docs/PRD-v3.md`（要做什么）；本文（怎么做） |
| 主题 | OINK 0.5.0（`../oink` 兄弟目录 checkout；`go.mod` 固定 v0.5.0，发布前用 `HUGO_MODULE_REPLACEMENTS` 指向兄弟目录，`make d` 已内置） |
| 工作分支 | `portal-v3`（worktree：`/Users/vonng/pgsty/.portal-v3/pgsty.com`）；`main` 不动 = 线上旧站 = 备份 |

---

## 状态（2026-08-18 晚）

**P1 骨架已在 `portal-v3` worktree 全部落地**（`/Users/vonng/pgsty/.portal-v3/pgsty.com`，分支 `portal-v3`，已 `git add -A`，未提交）：

- 步骤 1–9 完成：worktree + `archive/portal-v2/` 快照；OINK 壳层（六栏 mega-menu、胖页脚、hooks、portal-v2.css）；
  桥接 partial（bridge / pricing / pricing-compare / pricing-faq / services / tools / cloud-cases / cloud-essays / anchors）；
  首页 hex-hero + doors；EN/ZH 各 24 页：`/` `/get-started/` `/products/`(+5) `/services/`(+3) `/solutions/`(+cloud-exit, sovereignty)
  `/price/` `/about/` `/contact/` `/trust/` `/legal/`(+terms, privacy, support-policy) `/community/`；旧 bespoke 布局、landing-v3.css、
  portal-v1.css、vendor FA、portal 脚本已删除（快照仍在 archive/）。
- 验收：`hugo --panicOnWarning` 通过；`bin/check_brand_claims.py` 通过；`bin/check_internal_links.py` 通过（5405 引用 / 53 HTML）；
  `public/` 无 TODO、无未解析占位符；EN 页面无「海口 / Haikou」；data/landing 与 data/home 无裸数字；所有 YAML 通过 PyYAML 严格解析。
- 已截图核对：首页（桌面 / 移动 / ZH）、/price/、/products/pigsty/、/solutions/cloud-exit/（账本图、双计算器 JS 均工作）。

**未做 / 待办**：
- `go.mod` 固定 OINK v0.5.0 尚未发布到 GitHub → `make s` / CI / Cloudflare 无法解析；上线前先发 OINK tag（或临时回退 go.mod）。
- P2 页面（resources / news / customers / talks / compare / dbaas / health-check / lifecycle / trademark / brand）未建；
  导航「Resources」父项暂指 `/community/`。
- 首页 `proof`（客户引言）段 `enabled: false`，等 customers.yaml 授权。
- PRD §15 Q1–Q22 仍待拍板；本次按建议默认值实现。
- 深色模式未截图核对（样式全部走 OINK `--td-*` 变量，理论上跟随）；Lighthouse 未跑。
- 合并到 `main` 前：`git worktree` 内 review → commit → 发布 OINK 0.5.0 → merge → 两条部署链验收。

---

## 0. 结论

OINK 0.5 的 Landing 系统就是 Percona 页面工厂的现成实现：

- **任何页面**：`content/<path>.md` 写 `layout: landing` + `landing: <key>` → 页面 = `data/landing/<key>/{en,zh}.yaml` 里的一个 `sections` 列表。
- **22 种 section**：hero · metrics · capabilities · principles · cards · logo-wall · gallery · testimonials · contributors · faq · markdown · cta · pricing · pricing-compare · command-box · steps · timeline · code-plate · preview · case-study · download · bar-chart。Percona 五种模板的每一段都能对上。
- **导航**：`menus.main` 父项 + 子项，`params.columns: 1–4` 出 mega-menu，子项带 `icon` / `description`（pigsty.io 已这么用）。
- **页脚**：`data/footer/{en,zh}.yaml`（brand + columns）。
- **首页**：`data/home/{en,zh}.yaml` 同一套 sections。
- **逃生口**：每个 section 可写 `partial: <site partial>`，站点自定义部件（蜂窝字母板、三岔路口、下云账本与计算器）以此接入，不改主题。
- **单源数字**：OINK section 不插值 `hugo.Data`；用一个站点级「桥接 partial」把 `${brand.xxx}` 占位符替换成 `data/brand.yml` 的值后再交给 OINK 原生渲染器；价格 / 服务 / 项目卡由桥接 partial 直接从 pricing / services / projects.yaml 组装成 OINK 数据形状。**内容层不再有第二份数字。**

于是：旧站 5 张 bespoke 整页 HTML（605 行首页 + 4 子页）→ 新站 ≈ 40 份 YAML + 6 个站点 partial + 1 份 CSS。新增一页 = 新增一份 YAML。

---

## 1. 备份与分支策略（「当前网站内容备份保留」）

| 层 | 做法 | 恢复方式 |
|---|---|---|
| **线上旧站** | `main` 分支不改一行；Cloudflare / GitHub Pages 继续从 `main` 构建 | 什么都不用做 |
| **新站开发** | `git worktree add /Users/vonng/pgsty/.portal-v3/pgsty.com -b portal-v3`；把 main 工作区里未提交的 OINK 0.5 升级改动（go.mod / Makefile / hugo.yaml / palette / index.html 等 10 个文件）以 patch 形式应用到 worktree | 删除 worktree 即回到原状 |
| **旧站源码归档** | 在 `portal-v3` 分支内把 bespoke 源码整体复制到 `archive/portal-v2/`（layouts / data / content / static/css / static/js / hugo.yaml / Makefile / README），附 `README.md` 说明来源 commit 与恢复步骤；Hugo 不挂载 `archive/`，`make c` 的品牌声明扫描会扫到但无 ® 声明 | `cp -r archive/portal-v2/* .` |
| **切换上线** | 验收通过后 `portal-v3` 合并到 `main`（或 `main` 打 tag `portal-v2-final` 后快进） | `git revert` 或切回 tag |

主题侧：`../oink` 保持 0.5.0；worktree 目录旁放软链 `/Users/vonng/pgsty/.portal-v3/oink → ../oink`，让 `make d`（`THEME_DIR ?= ../oink`）在 worktree 里原样可用。

---

## 2. 目标文件树（portal-v3 分支）

```
hugo.yaml                         menus.main 六栏 mega-menu；params.ui.*；语言与命令面板
go.mod / go.sum / go.work         OINK v0.5.0（发布后去掉 replace）
Makefile                          d/s/b/c 不变
archive/portal-v2/                旧站源码快照（只读，见 §1）
data/
  brand.yml                       不变（数字唯一来源）
  footer/{en,zh}.yaml             OINK 胖页脚：brand + 5 栏 + 法务行
  home/{en,zh}.yaml               首页 sections（§4.1）
  landing/<key>/{en,zh}.yaml      每个子页一份（§4.2–4.7）
  portal/pricing.yaml             不变（桥接 partial 读取）
  portal/services.yaml            扩展：slug / deliverables / process
  portal/projects.yaml            不变（工具卡）
  portal/sites.yaml               不变（站点矩阵 → resources / community）
  portal/cloudcost.yaml           不变（账本 + 计算器）
  portal/products.yaml            新增（产品页六格 / 相关项引用）
  portal/solutions.yaml           新增（方案卡与相关项）
  portal/customers.yaml           新增（authorized:false 默认）
content/
  _index.md  _index.zh.md         layout: landing（首页走 data/home）
  get-started.md (.zh)            layout: landing, landing: get-started
  products/_index.md  pigsty.md  kernels-extensions.md  observability.md  infrastructure.md  tools.md（各 .zh）
  services/_index.md  subscription.md  consulting.md  emergency-migration.md（各 .zh）
  solutions/_index.md  cloud-exit.md  sovereignty.md（各 .zh）
  price.md (.zh)                  layout: landing, landing: price
  about.md (.zh)                  layout: landing, landing: about
  contact.md (.zh)                layout: landing, landing: contact
  trust.md (.zh)                  layout: landing, landing: trust
  legal/_index.md  terms.md  privacy.md  support-policy.md（各 .zh）
layouts/
  _partials/hooks/head-end.html   注入 static/css/portal-v2.css（内容 md5 指纹）
  _partials/hooks/body-end.html   注入 static/js/cloud-calc.js（仅 cloud-exit 页）
  _partials/portal/sections/
    bridge.html                   ${brand.*} 插值 → 调 OINK 原生 section
    hex-hero.html                 首页蜂窝字母板 hero（保留 .hex 负 margin 居中）
    doors.html                    三岔路口
    pricing.html                  pricing.yaml → OINK pricing
    pricing-compare.html          pricing.yaml matrix → OINK pricing-compare
    services.html                 services.yaml → OINK cards
    tools.html                    projects.yaml → OINK cards（版本 / 协议 / 星数 / 命令）
    cloud-exit.html               旧 cloud-exit 主体（账本图 + 计算器 + 价签表），逐段拆成 partial 后仍由此调度
  404.html                        沿用
static/css/portal-v2.css          只含站点特有组件：hex 板 / doors / 账本图 / 计算器 / glance 盒；品牌六色映射到 OINK 变量
static/js/cloud-calc.js           不变
bin/                              不变 + `check_landing_numbers.py`（可选：校验 data/landing 里无裸数字）
```

被移除（进 archive）：`layouts/index.html`、`layouts/_default/{about,price}.html`、`layouts/solutions/*.html`、
`layouts/_partials/portal/{nav,footer,head-meta,head-assets,foot-scripts,palette,contact-band,alternate-formats}.html`、
`static/css/landing-v3.css`、`static/css/portal-v1.css`。OINK 壳层（navbar / footer / head / scripts / palette / 深浅主题 /
搜索）全部由主题提供；`pgsty-landing-theme` 桥接层不再需要，主题状态用 OINK 自己的 key。

---

## 3. 壳层配置

### 3.1 导航（hugo.yaml `menus.main`，EN/ZH 各一份）

```yaml
- { identifier: products,  name: Products,  pageRef: /products,  weight: 10, params: { columns: 2 } }
- { identifier: p-pigsty,  parent: products, name: Pigsty Distribution, pageRef: /products/pigsty, params: { icon: fa-solid fa-database, description: The flagship — a free & better RDS alternative } }
- { identifier: p-ext,     parent: products, name: Kernels & Extensions, pageRef: /products/kernels-extensions, params: { icon: fa-solid fa-puzzle-piece, description: 12 kernels · 572 extensions · PIG } }
- { identifier: p-obs,     parent: products, name: Observability, pageRef: /products/observability, params: { icon: fa-solid fa-chart-line, description: Victoria + Grafana + pg_exporter } }
- { identifier: p-infra,   parent: products, name: Infrastructure & Silo, pageRef: /products/infrastructure, params: { icon: fa-solid fa-warehouse, description: Repos, offline packages, object storage } }
- { identifier: p-tools,   parent: products, name: Tools, pageRef: /products/tools, params: { icon: fa-solid fa-toolbox, description: Silo · PIG · pg_exporter · SOW } }
- { identifier: p-start,   parent: products, name: Get Started, pageRef: /get-started, params: { icon: fa-solid fa-rocket, description: One command, no registration } }
- { identifier: services,  name: Services,  pageRef: /services,  weight: 20, params: { columns: 2 } }
-   … subscription / consulting / emergency-migration / dbaas(P2) / support-policy
- { identifier: solutions, name: Solutions, pageRef: /solutions, weight: 30, params: { columns: 2 } }
-   … cloud-exit / sovereignty / reliability(P2) / migration(P2) / dbaas(P2)
- { identifier: pricing,   name: Pricing,   pageRef: /price,     weight: 40 }
- { identifier: resources, name: Resources, pageRef: /resources(P2；P1 先指 /community 或外链 docs), weight: 50, params: { columns: 2 } }
-   … Docs↗ / Blog↗ / Cloud Cost Calculator(/solutions/cloud-exit/#calculator) / News(P2) / Customers(P2) / Talks(P2) / Compare(P2) / Community(P2)
- { identifier: company,   name: Company,   pageRef: /about,     weight: 60, params: { columns: 1 } }
-   … About / Contact / Trust & Security / Legal / Brand(P2)
```

规则：一律指真实页面；导航项的 description 里若含数字，写占位（`${brand.ext_packaged}` 不能用于 menu，因此 menu description **不写数字**）；`menus.main` 同时驱动 OINK 的 llms.txt 与命令面板 quick links，从此只有一处真源（PRD §4.1 的 nav.yaml 不再需要）。

主 CTA：OINK navbar 无内置 CTA 按钮；用 `params.ui.navbar_actions`（若 0.5 提供）或把「Get Started」作为最右 menu 项 + `params.class`；否则 hero 双按钮承担（Percona 首页也只有 hero CTA + Connect）。

### 3.2 页脚（data/footer/{en,zh}.yaml）

brand：`name: PGSTY`，`tagline: '**P**ostgreSQL **I**n **G**reat **STY**le'`（i 弱化靠 CSS 类，不在 Markdown 里做），`slogan: Run a good database — and run it well.`；columns：Products / Services / Solutions / Resources / Company（PRD §4.5）；法务行与他人商标声明用 OINK 的 `copyright` 部件 + `params.copyright`（`authors: PGSTY PTE. LTD.` EN、`海口龙华辟技数据中心` ZH，`from_year: 2018`）。

### 3.3 样式

- 不再加载 landing-v3.css / portal-v1.css；OINK 的 landing CSS 承担 90%。
- `static/css/portal-v2.css` 只保留：`.hex*` 蜂窝板（负 margin 居中，不 transform）、`.doors`、cloud-exit 的账本图 / 计算器 / 价签表 / `.cx-*` `.cx2-*` 色板、`.glance`（AT A GLANCE 盒）、字标 `.wm-i` 弱化。目标 ≤ 25 KB。
- 品牌六色改写成 `--pg-*` 变量映射到 OINK `--td-*` 变量，深浅模式跟随 OINK。
- 通过 `layouts/_partials/hooks/head-end.html` 注入（OINK 公开钩子），带 md5 指纹。

### 3.4 元数据 / SEO

OINK `head.html` 已出 canonical / hreflang / OG / RSS。站点补：`params.images`（社交卡）、每页 `description`；结构化数据（Organization / FAQPage / Service+Offer）用 `hooks/head-end.html` 按 `.Params.schema` 输出。

---

## 4. 页面配方（sections 列表）

标注：`[oink]` = OINK 原生 section；`[bridge]` = 经 `portal/sections/bridge.html` 插值后调原生；`[site]` = 站点 partial。
数字一律写 `${brand.<key>}`（github_stars / ext_packaged / ext_catalogued / kernels / metrics_per_instance / series_per_instance / since_year / oss_since_year），由 bridge 替换。

### 4.1 首页 data/home/{en,zh}.yaml（Percona 顺序：理念 → 服务 → 场景 → 产品）

```yaml
sections:
  - { type: hero,          partial: portal/sections/hex-hero.html }      # tagline H1 + 副题 + 命令框 + 双 CTA + 蜂窝板 + 字标
  - { type: cards,         partial: portal/sections/doors.html, key: doors }   # 三岔路口
  - { type: principles,    key: yours,      partial: portal/sections/bridge.html }   # #yours 四原则 + motto
  - { type: pricing,       key: service,    partial: portal/sections/pricing.html, data: { compact: true } }   # #service 四档摘要
  - { type: cards,         key: ondemand,   partial: portal/sections/services.html }  # 四个按需服务小卡
  - { type: cards,         key: solutions }                                        # #solutions 四卡
  - { type: cards,         key: products,   partial: portal/sections/bridge.html }   # #postgres 四卡（Software / Docs 两链）
  - { type: metrics,       key: metrics,    partial: portal/sections/bridge.html, data: { animate: true } }   # #metrics
  - { type: testimonials,  key: proof,      enabled: false }                        # authorized 后开启
  - { type: cards,         key: resources }                                         # 文档 / 博客 / 计算器
  - { type: faq,           key: buyer_faq }                                         # 现有
  - { type: cards,         key: about }                                             # About teaser + 创始人卡
  - { type: cta,           key: contact }                                           # Let's talk PostgreSQL
```

段落 id 保持 `hero / start / yours / service / solutions / postgres / metrics / faq / about / contact`（`id:` 字段），`#infras #glass #graphics #toolbox` 作产品四卡的锚点由 hex-hero 与 products 卡上的 `id` 承接。

### 4.2 Products

| 页 | sections |
|---|---|
| `/products/` hub | hero[oink] → cards ×4 组（Distribution / Data layer / Management layer / Infrastructure layer，每卡 Docs + Install 两链）[bridge] → tools 卡[site] → markdown（协议声明）→ faq → cta |
| `/products/pigsty/` | hero（eyebrow `P · 01`）→ cards ×3（Software / Services / Docs & Downloads）→ capabilities（六格价值 + `pigsty.yml` code visual）[bridge] → metrics[bridge] → cards（相关方案）→ command-box（安装）→ faq → cta |
| `/products/kernels-extensions/` | hero → capabilities（内核 / PGEXT / PIG）[bridge] → cards（相关方案）→ command-box（`pig install`）→ faq → cta |
| `/products/observability/` | hero（`G · 03`）→ capabilities[bridge] → metrics（600+ / 3,000）[bridge] → cards（demo / pg_exporter / 相关服务）→ faq → cta |
| `/products/infrastructure/` | hero（`I · 02`）→ capabilities（仓库 / 离线包 / Silo / SOW；INFRA ENDPOINTS code-plate visual）[bridge] → markdown（gift-note → /about/#missing-i）→ cards（相关方案）→ faq → cta |
| `/products/tools/` | hero（`T · 05`）→ tools 卡[site]（Silo · PIG · pg_exporter · SOW；GitHub · Docs · Roadmap）→ cta |
| `/get-started/` | hero（align center）→ command-box（curl；ZH 换 .cc）→ steps（在线 / 离线 / 容器）→ cards（下一步：Docs / demo / PIG / 求助）→ faq → cta |

### 4.3 Services

| 页 | sections |
|---|---|
| `/services/` hub | hero → markdown（三模式对照表，Markdown 表格 `{.matrix}`）→ pricing[site]（四档摘要）→ services 卡[site] → cards（WHEN TO CALL US 六条）→ faq → cta（pricing=true） |
| `/services/subscription/` | hero（价格锚）→ pricing[site] → pricing-compare[site]（只取「技术支持」「增值服务」组）→ markdown（订阅买到的是什么 / 30 天试用）→ cards（相关方案）→ faq[bridge]（pricing.yaml faq）→ cta |
| `/services/consulting/` | hero → cards（挂号 / 咨询 / 顾问，价格来自 services.yaml）[site] → steps（来信 → 排期 → 会话 → 回访）→ cards（相关）→ faq → cta |
| `/services/emergency-migration/` | hero → cards（四类工作）→ steps（评估 → 演练 → 切换 → 回访）→ markdown（边界说明）→ cards（相关方案）→ faq → cta |
| `/services/health-check/`（P2） | hero（Starting from）→ **glance**[site] → cards（交付物）→ markdown（WHO IT'S FOR）→ steps（Scope → Execute → Hand Off）→ cta |

### 4.4 Solutions

| 页 | sections |
|---|---|
| `/solutions/` hub | hero（Start from what you're trying to do）→ cards（六方案卡；未建页者无 url）→ markdown（目标 → 方案 → 服务档位）→ cta |
| `/solutions/cloud-exit/` | hero（Stop renting your database）→ metrics（四判词，来自 cloudcost.tiles）[site] → **cloud-exit**[site]（三大件谱系 + 对象存储小计算器 + 全家桶计算器 + 行业价签 + 口径来源）→ case-study ×N 或 cards（公开案例）→ steps（下云四步 + 每步档位）→ faq（三句反驳）→ cards（文选三组）→ cards（相关服务 / 产品）→ faq → cta（Let's price out your exit） |
| `/solutions/sovereignty/` | hero（问题句）→ markdown（反派 / 问题陈述）→ principles（五条价值主张，各挂产品或服务）→ cards（证据：loong64 进 PGDG / 离线包 / Silo）→ steps（落地路径）→ cards（相关产品与服务）→ faq → cta；ZH 独立成文（信创） |
| `/solutions/{reliability,migration,dbaas}/`（P2） | 同上骨架 |

### 4.5 Pricing `/price/`

hero → pricing[site] → pricing-compare[site]（全矩阵）→ services 卡[site] → faq[bridge] → cta。P2 加节点速算 partial。

### 4.6 Company

| 页 | sections |
|---|---|
| `/about/` | hero（使命句）→ markdown（起源段）→ markdown + code-plate（少掉的 i + `name.yml` 板；id `missing-i`）→ timeline（五条）→ markdown（Deliberately small，id `small`）→ cards（主体 ×1 按语言 + 创始人）→ metrics（三个数字）[bridge] → cta |
| `/contact/` | hero（align center）→ cards（邮箱主题模板 ×5 / 微信 / Discussions / Discord）→ markdown（实体 + 时区 + 期望响应）→ faq → cta |
| `/trust/` | hero → principles（零遥测 / 签名校验 / 供应链 / 披露 / Silo 安全更新）→ markdown（详细）→ cards（政策入口）→ cta |
| `/legal/`、`/legal/terms/`、`/legal/privacy/`、`/legal/support-policy/` | hero → markdown（正文）；support-policy 加 pricing-compare[site]（技术支持组）→ cta |
| `/community/`（P2） | hero → cards（渠道）→ logo-wall（sites.yaml 站点矩阵）→ cta |

---

## 5. 站点 partial 契约

| partial | 输入 | 行为 |
|---|---|---|
| `portal/sections/bridge.html` | 任意 section（`type` + `data`） | `jsonify` 数据 → 替换 `${brand.<key>}`（brand.metrics + wordmark / tagline*）→ `transform.Unmarshal` → 按 `type` 调 OINK 注册表里的原生 partial；未知 type `warnf` |
| `portal/sections/hex-hero.html` | data.home 的 hero 键（title 来自 brand.tagline*） | 复用旧 hero 标记：eyebrow 实体 · H1 tagline · 副题 · 命令框 · 双 CTA · 蜂窝板 · 字标；CTA 用 OINK `td-landing-button` 类 |
| `portal/sections/doors.html` | items[3]（icon / title / desc / url） | 三张 door 卡（旧标记 + `.doors` CSS） |
| `portal/sections/pricing.html` | `data.compact`（可选） | pricing.yaml tiers → OINK `pricing` 数据形状（按语言取 name/tier/tagline/price/period/features/cta/url） |
| `portal/sections/pricing-compare.html` | `data.groups`（可选：只取某几组） | pricing.yaml matrix → OINK `pricing-compare` |
| `portal/sections/services.html` | — | services.yaml → OINK `cards`（name / desc / meta = price / url mailto） |
| `portal/sections/tools.html` | `data.keys`（可选顺序，默认 silo/pig/pg_exporter/sow） | projects.yaml → OINK `cards`（meta = kind · version · license · ★stars；desc；三链 GitHub / Docs / Roadmap；安装命令 code） |
| `portal/sections/cloud-exit.html` | cloudcost.yaml | 旧 cloud-exit.html 主体分段搬入（谱系图 / 对象存储 / 全家桶计算器 / 价签 / 来源），JSON `#cloudcalc-data` 保留给 cloud-calc.js |
| `hooks/head-end.html` | — | portal-v2.css 指纹链接；`schema` 结构化数据 |
| `hooks/body-end.html` | — | 仅当页面 `landing: cloud-exit` 时注入 cloud-calc.js |

---

## 6. 内容迁移映射（旧 → 新）

| 旧位置 | 新位置 |
|---|---|
| index.html hero | data/home hero（hex-hero partial） |
| index.html #start doors | data/home doors |
| index.html #metrics | data/home metrics（bridge） |
| index.html #postgres 模块 | data/landing/products-pigsty capabilities；首页 products 卡一句话 |
| index.html #infras 模块 + gift-note | data/landing/products-infrastructure |
| index.html #glass 模块 | data/landing/products-observability |
| index.html #service（卡 + WHEN TO CALL US + 价格 teaser） | data/landing/services hub + 首页 service / ondemand |
| index.html #toolbox | data/landing/products-tools（tools partial） |
| index.html #yours（四原则 + values.yml 板 + 文选按钮） | data/home yours（principles）+ data/landing/solutions-sovereignty |
| data/home buyer_faq | 不变 |
| index.html About teaser + contact band | data/home about + contact |
| about.html 全部 | data/landing/about |
| price.html 全部 | data/landing/price（pricing / pricing-compare / services partial） |
| solutions/list.html | data/landing/solutions |
| solutions/cloud-exit.html | data/landing/cloud-exit + portal/sections/cloud-exit.html |
| nav.html / footer.html | hugo.yaml menus + data/footer |
| head-meta / head-assets / foot-scripts / palette | OINK head / scripts + hooks/head-end |
| content/*.md 隐形正文 | 各页 hero.lead 或 markdown section（真正渲染） |

---

## 7. 执行步骤（有序；每步后站点可构建）

1. **分支与备份**：worktree `portal-v3`；应用 main 的 WIP patch；`archive/portal-v2/` 快照 + README；`.portal-v3/oink` 软链。✅ 构建通过。
2. **壳层**：hugo.yaml menus 六栏（EN/ZH）；data/footer；hooks/head-end + portal-v2.css 骨架；`params.copyright`；移除 portal nav/footer 依赖。此时旧 bespoke 页仍在（它们自带 nav/footer），先不删。
3. **桥接 partial**：bridge / pricing / pricing-compare / services / tools；用 `/price/` 先验证（price.md → layout: landing）。
4. **首页**：hex-hero + doors partial 移植；data/home 全 sections；`layouts/index.html` 移入 archive；旧锚点全部保留。
5. **Products**：hub + 5 子页 + get-started（EN/ZH YAML）。
6. **Services**：hub + 3 子页。
7. **Solutions**：hub + sovereignty；cloud-exit 主体拆入 `portal/sections/cloud-exit.html`，页面改 landing。
8. **Company**：about / contact / trust / legal ×4。
9. **清理**：删除旧 layouts（已在 archive）、landing-v3.css / portal-v1.css；`bin/check_internal_links.py` 通过；`make c` 全绿。
10. **验收**：PRD §14 十三条 + Lighthouse；EN/ZH 截图（桌面 / 移动 / 深色）。
11. **P2**：resources / news / customers / talks / compare / community / dbaas / health-check / lifecycle / trademark / brand。

---

## 8. 风险与对策

| 风险 | 对策 |
|---|---|
| OINK 0.5.0 未发布到 GitHub（`go.mod` v0.5.0 解析失败） | 本地用 `HUGO_MODULE_REPLACEMENTS`（`make d`）；CI / Cloudflare 上线前必须先发布 tag，或临时把 go.mod 退回可解析版本 |
| OINK 壳层视觉 ≠ 旧 portal-v1 视觉 | 家族站 pigsty.io / .cc 已是 OINK Landing 外观；蜂窝板 / doors / 账本作为站点 partial 保留签名视觉 |
| landing YAML 里出现裸数字（破坏单源） | 只允许 `${brand.*}` 占位；新增 `bin/check_landing_numbers.py` grep `data/landing data/home` 中的 572 / 5510 / 2230 等 |
| menu description 不能插值 | 导航说明不写数字 |
| cloud-exit 页最重（自定义图表 + JS） | 第 7 步单独做；先整体包成一个 partial 保证不回退，再逐段 OINK 化（bar-chart 可替代静态谱系图，计算器仍自定义） |
| 中文站不是翻译 | 每份 `zh.yaml` 独立成文；信创 / 联系 / 法务页与 EN 结构可不同 |
| Q1–Q22 未拍板 | 用 PRD §15 默认值；YAML 改动成本极低 |
