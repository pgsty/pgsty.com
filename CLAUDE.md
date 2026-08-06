# PGSTY Portal (pgsty.com)

公司门户站：Hugo + Docsy，脚手架复制自 ~/pgsty/silo.pgsty.com。
英文 `/`，中文 `/zh/`。首页 + /price/ + /about/ + /solutions/cloud-exit/ 四个核心页面。
信息架构 = 双轴：纵轴六字母（我们有什么），横轴 Solutions（你要干什么）——PRD v2（2026-08）。

## 命令

- `make dev` — 本地预览（hugo server）
- `make build` — 生产构建（--minify --cleanDestinationDir）
- `make check` — 严格构建（--panicOnWarning）+ bin/check_internal_links.py
- `bin/metrics.py update` — 刷新 data/brand.yml 与 data/portal/projects.yaml 里的 GitHub 星数

推到 main 触发 `.github/workflows/cloudflare.yml`：构建 + 内链检查后强推产物到
**`page`** 分支（分支名固定，与 pigsty.cc 一致，勿改），Cloudflare Pages 接该分支，
用默认域名。不用 GitHub Pages —— 私有仓库 + free 组织，计划不支持。

## 数字单源（验收红线）

所有易变数字（星数 / 扩展数 / 内核数 / 指标数 / 年份）只写在 **`data/brand.yml`**
（`hugo.Data.brand.metrics.*`）；价格档位在 data/portal/pricing.yaml 与 services.yaml，
项目版本与星数在 data/portal/projects.yaml。content/ 或 layouts/ 硬编码视为 bug，验收命令：

    grep -rn "5347\|5,347\|562\|2230\|2,230\|444" content/ layouts/ i18n/ | grep -v data/   # 应为空

`ext_bundled: 444` 语义未确认（PRD §12.2），**禁止上页**；对外扩展数唯一口径 = ext_packaged(562)。

## 页面与布局

- 首页 `layouts/index.html`，**不走 Docsy 模板**，双语用 `{{ if $zh }}` 内联；
  数据从 `hugo.Data.brand.*` / `hugo.Data.portal.*` 读取（`.Site.Data` 已弃用）。
- 板块锚点：`#postgres #infras #glass #service #toolbox #yours`。
  **G 板块 2026-08 由 GRAPHICS 改名 GLASS**；`#graphics` 是 `#glass` 的别名
  （section id=glass，内层 container id=graphics），老外链不能断，勿删。
- hero 主标题 = tagline（brand.yml），字标 `PostgreSQL In Great STYle` 在字母板下方
  （`.board-epigraph`，`In` 的 i 用 `.wm-i` 弱化）。**missing-i 梗全站只完整出现两处**：
  首页短版 + /about/ 长版；页脚只许一行提示（§3.3 克制条款）。
- 子页均为独立完整 HTML 布局：/price/（layouts/_default/price.html）、
  /about/（layouts/_default/about.html，alias /company/about/）、
  /solutions/（layouts/solutions/list.html）、/solutions/cloud-exit/（layouts/solutions/cloud-exit.html）。
  zh 内容文件**不能**写 `url:`（会覆盖语言前缀导致双语同路径冲突）；新页 URL 变更用 aliases。
- 公共部件在 layouts/_partials/portal/：head-assets（主题引导+CSS 指纹）、
  head-meta（子页 <head>，标题模式 `<页名> — PGSTY`）、nav（`dict "page" . "active"
  "home|price|solutions|about"`，含 Product/Company 纯 CSS 下拉）、footer、
  contact-band（可传 title/desc/pricing 参数）、foot-scripts。
- cloud-exit 的 TCO 表数据在 data/portal/tco.yaml：单元格必须 price+source+date
  三者齐备才渲染数字，否则出 TODO 占位。**禁止无来源数字**（PRD §7.2）。
- 页面上凡待用户拍板的事实一律 `TODO(user)` 占位（可见 `.todo-flag` / `.todo-chip`
  或 HTML 注释），严禁编造：SLA、客户案例、piglet 链接、里程碑年份等。

## 关键约定

- 实体按语言拆分：英文站只写 PGSTY PTE. LTD.（新加坡），中文站只写
  海口龙华辟技数据中心 —— 见各布局 `$entity` 变量与页脚；英文站不出现 Haikou。
- 样式分两层：`static/css/landing-v3.css` 是家族设计系统（Pigsty Landing v3，
  与 pigsty.cc / silo.pgsty.com 共享，token 与品牌六色勿改）；门户组件全部在
  `static/css/portal-v1.css`（含 v2 新增：doors / epigraph / timeline / manifesto /
  todo-flag / tco / artifact-plate 等）。CSS 用内容 md5 做缓存指纹（见 head-assets）。
- hero 蜂窝主板：`.hex` 用负 margin 居中，**不能用 transform 居中**
  （`.anim` 入场动画会覆写 transform）。
- 主题切换 localStorage key：`pgsty-landing-theme`。
- 中文站是本地化不是翻译，两边卖点各自成文；术语强制：self-hosted → **自建**
  （禁「自托管」）、cloud exit → **下云**、observability → **可观测性**。
- 内容数字（价格 / 服务 / 指标）以 pigsty.cc/price、pigsty.io/price 与
  pigsty.cc/docs/about/service 为准，改动需同步。
- bin/check_internal_links.py 校验站内链接与锚点（含 hreflang 绝对链接，
  SITE_HOSTS=pgsty.com），且**站内不得链接 alias 重定向页**（如 /company/about/）。
- 无跟踪脚本 —— 与零遥测主张一致；如需统计需用户选自托管方案（PRD §12.10）。
- 文档章节（layouts/docs 等 Docsy chrome）是 silo 带来的休眠设施，当前无内容；
  若启用文档需先清理其中的 SILO 品牌残留（layouts/_partials/footer.html、
  head-end hook、head-css 等）。

## 公司事实（写文案时用）

- PGSTY PTE. LTD.（新加坡，全球业务）+ 海口龙华辟技数据中心（中国大陆，
  统一社会信用代码 92460000MAG0XJ569B）。
- PIGSTY® / PGSTY® 为注册商标；创始人冯若航（@Vonng），奇绩创坛 S22。
- 创始人履历（/about/ 全列）：Pigsty 作者（2018 至今）、PostgreSQL 从业 11 年、
  PG 中文文档译者（pg.center）、DDIA 中文译者、曾任职 Alibaba/Tantan/Apple、
  推动 PGDG 官方仓库支持 loong64（2026-07）。
- 商务邮箱 rh@vonng.com；微信 RuohangFeng。
- Keeper lines（PRD 附录 A）：改版时必须保留的句子清单，验收逐条 grep。
