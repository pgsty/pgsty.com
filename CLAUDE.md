# PGSTY Portal (pgsty.com)

公司门户站：Hugo + OINK（`github.com/pgsty/oink` Hugo Module）。
英文 `/`，中文 `/zh/`。首页 + /price/ + /about/ + /solutions/cloud-exit/ 四个核心页面。
信息架构 = 双轴：纵轴六字母（我们有什么），横轴 Solutions（你要干什么）——PRD v2（2026-08）。

## 命令

- `make d` / `make debug` — 用相邻的 `../oink` checkout 调试主题
- `make s` / `make serve` — 用 go.mod 固定的主题版本本地预览
- `make b` / `make build` — 生产构建（--minify --cleanDestinationDir）
- `make c` / `make check` — 严格构建（--panicOnWarning）+ 品牌声明与内部链接检查
- `bin/metrics.py update` — 刷新 data/brand.yml 与 data/portal/projects.yaml 里的 GitHub 星数

推到 main 后有两条独立部署链：`.github/workflows/pages.yml` 构建并部署 GitHub
Pages；Cloudflare Pages 的 `pgsty-com` 项目直接连接 main，以 Hugo 构建并服务
pgsty.com。两边固定使用 Hugo extended 0.164.0，不能把本地构建、Actions 成功、
Cloudflare 部署和公开域名可访问混为同一验收状态。

## 数字单源（验收红线）

所有易变数字（星数 / 扩展数 / 内核数 / 指标数 / 年份）只写在 **`data/brand.yml`**
（`hugo.Data.brand.metrics.*`）；价格档位在 data/portal/pricing.yaml 与 services.yaml，
项目版本与星数在 data/portal/projects.yaml。content/ 或 layouts/ 硬编码视为 bug，验收命令：

    grep -rn "5347\|5,347\|572\|2230\|2,230" content/ layouts/ i18n/ | grep -v data/   # 应为空

对外扩展数唯一口径 = ext_packaged(572)。
`kernels: 12` 以 pigsty.io 首页「12 PG kernel forks」口径为准；`oss_since_year: 2020` 供指标带
「Open source since」，`since_year: 2018` 只用于 EST. 与版权行，两者勿混。

## 页面与布局

- 首页 `layouts/index.html`，**不走 OINK 标准页面模板**，双语用 `{{ if $zh }}` 内联；
  专属模块从 `hugo.Data.brand.*` / `hugo.Data.portal.*` 读取，可组合扩展区块由
  `data/home/<lang>.yaml` 经 OINK dispatcher 渲染（`.Site.Data` 已弃用）。
- 板块锚点：`#postgres #infras #glass #service #toolbox #yours`。
  **G 板块 2026-08 由 GRAPHICS 改名 GLASS**；`#graphics` 是 `#glass` 的别名
  （section id=glass，内层 container id=graphics），老外链不能断，勿删。
- hero 主标题 = tagline（brand.yml），字标 `PostgreSQL In Great STYle` 在字母板下方
  （`.board-epigraph`，`In` 的 i 用 `.wm-i` 弱化）。**hero 不解释 i 为什么少**（用户
  2026-08 指示）：missing-i 故事只在 /about/ 长版 + 页脚一行提示；I 板块 gift-note
  链接指 /about/#missing-i。
- **hero 蜂窝没有外框（用户 2026-08 指示）**：主板窗框（边框 / 圆角 / 阴影 / 22px 底纹
  网格）与顶栏「PGSTY // COMPANY BOARD · EST. 2018」、底栏「P·I·G·S·T·Y · 6 SECTIONS
  ONLINE」全部去掉，只留六边形本身，字标紧贴其下。`.board-mount`（max-width 560px，
  ≤980px 时 460px）是蜂窝与字标共用的宽度基准 —— `.board-epigraph` 的
  `margin-top: -6.4%` 按它解析，用来吃掉 `.hex-field` 下缘那段 8.13%（T 格底边在
  87.87%，盒高 96%）的死区。**动这两个数任何一个，另一个都要跟着重算。**
  EST. 年份仍在 /about/ 与页脚版权行，没有被孤立。
- 子页均为独立完整 HTML 布局：/price/（layouts/_default/price.html）、
  /about/（layouts/_default/about.html，alias /company/about/）、
  /solutions/（layouts/solutions/list.html）、/solutions/cloud-exit/（layouts/solutions/cloud-exit.html）。
  zh 内容文件**不能**写 `url:`（会覆盖语言前缀导致双语同路径冲突）；新页 URL 变更用 aliases。
- 公共部件在 layouts/_partials/portal/：head-assets（主题引导+CSS 指纹）、
  head-meta（子页 <head>，标题模式 `<页名> — PGSTY`）、nav（`dict "page" . [...]`）、
  footer、contact-band（可传 title/desc/pricing 参数）、foot-scripts。
  `palette.html` 是 OINK 门户桥接层：复用主题的分语言同源索引、Command Palette、
  共享页面动作与安全命令，外加 0.6 导航栏所需的那点运行时（navbar-menu / base /
  landing），但仍不引入整套 docs shell；`foot-scripts.html` 必须在每个门户布局末尾调用它。
- **导航栏 = OINK 0.6 的 site-navbar（2026-08 起）**，`portal/nav.html` 只是桥接：
  DOM 与样式全部来自主题，条目复用 `navbar-item` / `navbar-entry-link` /
  `navbar-group-items` / `language-selector`。**导航内容的唯一来源是 hugo.yaml 的
  `menu.main`（双语各一棵树）**，改导航改配置、不要改模板；站内条目写不带语言前缀的
  路径（`/#infras`、pageRef），OINK 用 relLangURL 补前缀，写成 `/zh/...` 会重复前缀。
  下拉面板固定单列图标行（0.6 破坏性变更：`columns` 已废弃，`description` 不渲染），
  图标写在条目的 `params.icon`。高亮由主题按 pageRef/URL 自判，`active` 入参只为兼容
  旧调用点保留。栏高 50px。门户自己决定的三件事：
  1. **导航栏不放 GitHub 与 Star 数**（用户 2026-08 指示：这是公司门户，不是项目
     仓库页）。GitHub 只留在页脚社区栏。因此 `menu.main` 里也没有 github 条目。
  2. 语言与配色合成右上角一枚分段控件 `.portal-nav-utils`（portal-v1.css），与搜索框
     同高同框；语言触发器显示**目标**语言的母语短标（EN / 中文）而不是主题默认的
     `fa-language` 字形，点一下直接切换，悬停展开完整列表。数据仍取自主题的
     `language-targets.html`。弹层里的 `<a>` 会被 `.landing-page a` 染蓝，已压回中性色。
  3. 抽屉在**每个**门户页面都渲染（主题只给 Home/Landing），且抽屉里额外放语言与配色
     （0.6 把它们交给了 fat footer 的 dock，门户用的是自己的页脚）。
- cloud-exit 是「下云宣言 + 账本」页：全部成本数字在 **data/portal/cloudcost.yaml**
  （三大件谱系[数据库/算力/对象存储] / 计算器矩阵 / 判词 / 案例 / 行业锚点 / 文选 /
  来源），出处 = vonng.com/cloud 公开文章（EN 用 /en/cloud 镜像，均逐篇核实）+
  厂商价格页（refs 带抓取日期）；算力与 RDS 口径 2025-04、汇率 7.24。
  **禁止无来源数字**；模板与 JS 里硬编码成本数字视为 bug。
  交互计算器（static/js/cloud-calc.js 读 #cloudcalc-data JSON）：八旋钮 = vCPU ×
  内存比 × 节点数 × 存储 × 付费周期 × 订阅档位 × 币种 × 月/年；节点模型 = RDS 单节点
  按单实例基础版（≈高可用÷2.35）、双节点按高可用、更多按主备+只读；云侧存储一律
  按单份保守计，自建每节点一份全量副本；订阅取所选币种的挂牌价（非汇率换算）。
  图表两套色板（.exit-page）：--cx-*（部署三分组）与 --cx2-*（堆叠成分：算力/存储/
  订阅），四组 token 全部过 dataviz 六项校验，改色需重跑；每张图配 details 数据表
  与直标数值。**模板坑**：谱系取 max 时 int/float 混用的 `gt` 会退化成字符串比较，
  必须 `gt (float .price) $max`。
- 待用户拍板的事实保留在源码注释或数据占位中，公开页面不得渲染 `TODO`；严禁编造
  SLA、客户案例、piglet 链接、里程碑年份等。
- T 板块项目卡顺序固定：Silo、PIG、pg_exporter、SOW；四张卡都使用
  projects.yaml 的完整版本、协议、星数、描述与命令，标题及文档入口指向各自独立官网。
  piglet 在真实仓库、官网、版本与安装方式齐备前暂不露出（PRD §6.8）。

## 关键约定

- 实体按语言拆分：英文站只写 PGSTY PTE. LTD.（新加坡），中文站只写
  海口龙华辟技数据中心 —— 见各布局 `$entity` 变量与页脚；英文站不出现 Haikou。
- 样式分三层：`static/css/landing-v3.css` 是家族设计系统（Pigsty Landing v3，
  与 pigsty.cc / silo.pgsty.com 共享，token 与品牌六色勿改）；门户组件全部在
  `static/css/portal-v1.css`（含 v2 新增：doors / epigraph / timeline / manifesto /
  tco / artifact-plate 等）；OINK 的导航栏 chrome 与可组合区块由
  `assets/scss/portal-oink.scss` 从锁定的模块现编（shell/tokens + language-selector +
  site-navbar + theme-toggle + landing），**每个页面都加载**。前两层用内容 md5 做缓存
  指纹，第三层用 Hugo fingerprint（见 head-assets）。
  **不编译 `td/brand`**（它会用主题自己的配色覆盖全站）：portal-v1.css §22 把
  Landing v3 的 token 映射到 `:root` 上的 `--bs-*` / `--td-brand-*`，`td/shell/tokens`
  再由此推导出全部 `--td-shell-*`。
  **只挑一个主题 SCSS 编译是有坑的**：`_landing.scss` 里的区块用 `.td-site-container`
  排版，而这条规则住在 `_site-navbar.scss` —— 曾经只 `@import 'td/landing'`，于是首页
  FAQ 整段没有容器宽度、通栏靠左（2026-08 已修）。新增主题模块时，先 grep 它用到的
  类与 token 分别定义在哪个文件里，别只按名字猜。
  另：`.td-landing-landing` 自带 44px 网格与不透明底色，与门户 `body::before` 的固定
  网格叠加会出摩尔纹，portal-v1.css 已把区块那层关掉。
- hero 蜂窝主板：`.hex` 用负 margin 居中，**不能用 transform 居中**
  （`.anim` 入场动画会覆写 transform）。
- 主题切换 localStorage key：`pgsty-landing-theme`。配色状态归门户所有：主题的
  `dark-mode.js` **刻意不加载**，导航栏的直切钮（`[data-td-theme-toggle]`）与三档
  选项（`[data-bs-theme-value]` 亮/暗/跟随系统）由 `assets/js/portal-palette.js`
  桥接到 `PGSTYPortalTheme`，不得再引入第二套配色存储。
- OINK 命令面板：`Cmd/Ctrl-K` 与 `/` 都进搜索并显示页面动作，`\` 才是命令模式
  （0.6 起，导航栏搜索框上的 `/` 提示即此）；0.6 新增的 `copy_link` 动作随注册表
  自动可用。
- 中文站是本地化不是翻译，两边卖点各自成文；术语强制：self-hosted → **自建**
  （禁「自托管」）、cloud exit → **下云**、observability → **可观测性**。
- 内容数字（价格 / 服务 / 指标）以 pigsty.cc/price、pigsty.io/price 与
  pigsty.cc/docs/about/service 为准，改动需同步。
- bin/check_internal_links.py 校验站内链接与锚点（含 hreflang 绝对链接，
  SITE_HOSTS=pgsty.com），且**站内不得链接 alias 重定向页**（如 /company/about/）。
- Google Analytics 仅在生产构建启用，Measurement ID 为 `G-JLB25NYKJX`；本地预览
  不加载统计脚本，产品本身的零遥测主张不变。
- 文档与博客的标准布局、导航、搜索、短代码由 OINK 提供，当前仓库不复制这些
  框架文件；若启用相应内容，应优先通过 OINK 的公开覆盖点定制，避免重新分叉主题。

## 公司事实（写文案时用）

- PGSTY PTE. LTD.（新加坡，全球业务）+ 海口龙华辟技数据中心（中国大陆，
  统一社会信用代码 92460000MAG0XJ569B）。
- PIGSTY / PGSTY 当前只作普通品牌名称使用，不附加任何登记状态符号或声明；
  创始人冯若航（@Vonng），奇绩创坛 S22。
- 创始人履历（/about/ 全列）：Pigsty 作者（2018 至今）、PostgreSQL 从业 11 年、
  PG 中文文档译者（pg.center）、DDIA 中文译者、曾任职 Alibaba/Tantan/Apple、
  推动 PGDG 官方仓库支持 loong64（2026-07）。
- 商务邮箱 rh@vonng.com；微信 RuohangFeng。
- Keeper lines（PRD 附录 A）：改版时必须保留的句子清单，验收逐条 grep。
