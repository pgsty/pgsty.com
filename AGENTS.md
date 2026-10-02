# PGSTY 公司官网维护指南

作用域：本仓库。按 2026-10-01 的实际代码校准；开始工作先读本文件与
[README.md](README.md)，检查当前目录、分支、工作树与已有改动。用户当前要求优先，
版本和实现细节以对应源文件为准。

## 项目定位与现行设计

- 本站是 **PGSTY PTE. LTD.** 的中英双语公司官网：英文 `/`，中文 `/zh/`。
  两种语言介绍同一家新加坡公司；公司信息统一引用 `data/company.yaml`。
- 技术栈为 Hugo Extended + Go Modules，主题是 `github.com/pgsty/oink`，
  当前由 `go.mod` 固定为 `v1.1.0`。检查脚本使用 Python 3 标准库；没有 npm 构建流程。
- 首页依次介绍开源软件、公共资源、专业服务、合作原则、FAQ 与联系入口。
  软件目录与公共资源目录分别承接完整介绍，保持用途清楚、链接直接、文案克制。
- Hero 保持当前两行口号：英文 `Open Data Infrastructure` / `Built for Real Production`；
  中文 `开源数据基础设施` / `为真实生产而构建`。下方两句说明突出 PostgreSQL 软件、
  咨询支持与数据库自主掌控，按钮指向服务和开源软件。不要恢复已移除的三条小字或字母板。
- [PRD-v3](docs/PRD-v3.md) 和 [IMPL-v3](docs/IMPL-v3.md) 是 2026-08 的历史方案，
  其中旧字母板、按语言区分公司主体、OINK 0.5、旧工作树与分期清单不是当前要求。
  [公司审阅记录](docs/CORPORATE-REVIEW.md) 保存来源与当时的本地验证，不代表当前发布状态。

## 页面与数据入口

| 内容 | 当前入口与维护位置 |
|---|---|
| 首页 | `layouts/index.html`；`content/_index.md` 与 `_index.zh.md` 提供对应正文和搜索内容 |
| 软件 `/projects/` | `layouts/_default/projects.html`、`data/portal/projects.yaml`、`portal/project-card.html` |
| 资源 `/resources/` | `layouts/_default/resources.html`、`data/portal/resources.yaml`、`portal/resource-list.html` |
| 服务 `/services/` | `layouts/_default/services.html` 与双语 Markdown 正文 |
| 价格 `/price/` | `layouts/_default/price.html`、`data/portal/pricing.yaml`、`services.yaml` |
| 方案 `/solutions/` | `layouts/solutions/list.html` 与对应 content；下云页使用 `cloud-exit.html` |
| 下云计算器 | `static/js/cloud-calc.js`、`data/portal/cloudcost.yaml` 及价格、服务数据 |
| 公司 `/about/` | `layouts/_default/about.html`、`data/company.yaml` 与双语 content |
| 联系、隐私、条款 | `content/{contact,privacy,terms}{.md,.zh.md}`，共用 `layouts/_default/corporate.html` |
| 首页 FAQ | `data/home/en.yaml`、`zh.yaml` 的 `buyer_faq.items` |
| 公司事实、结构化数据 | `data/company.yaml`、`layouts/_partials/portal/organization.html` |
| 菜单与搜索快捷入口 | `hugo.yaml` 各语言的 `menu.main`、命令配置及 OINK `quick_links` |
| Markdown / LLMS | `layouts/all.md`、页面正文与 OINK 输出格式 |

表中的 `portal/*.html` 均位于 `layouts/_partials/portal/`。

- 软件注册表现有 Pigsty、Silo、PIG、Barn、SOW、PG Exporter。简介、用途、仓库、
  文档与许可证在注册表中维护，首页和目录共用卡片；新增项目还需检查两处模板的项目顺序。
- 公共资源包括软件包仓库、PostgreSQL 中文文档、PG.CENTER、知识图谱、扩展目录。
  仓库入口指向可阅读的安装文档，避免将包存储桶根目录当作介绍页。
  `data/portal/sites.yaml` 是旧站点矩阵，当前资源模板不读取它。
- `data/brand.yml` 保留品牌与指标字段，部分数值是历史快照；公司事实以 `company.yaml`
  为准，当前 Hero 以首页模板为准。不要把旧 tagline 或计数重新当作当前首页内容。
- 自定义 HTML 模板不一定输出 `.Content`：首页和资源目录目前不输出正文；项目、服务页
  会在自定义板块后输出正文。修改文案时核对模板、双语 Markdown、description 与搜索关键词，
  避免 HTML、搜索结果和 Markdown / LLMS 内容不一致。
- 中英文件使用一致的 `translationKey`。站内链接使用 `relLangURL` / `pageRef` 等现有机制；
  中文 front matter 不要设置绕过 `/zh/` 的根路径 `url`。菜单以配置为源，页脚仍需单独核对。

## 样式与交互边界

- `static/css/corporate.css` 最后加载，负责当前公司站视觉：默认浅色、克制的蓝色、响应式布局。
  `landing-v3.css` 与 `portal-v1.css` 仍提供基础样式；后者也映射 `--bs-*` / `--td-*`，
  不只是计算器样式。修改前检查层叠关系，不因名称较旧就删除。
- `assets/scss/portal-oink.scss`、`portal-palette.scss` 经 Hugo 编译主题样式；
  `portal/head-assets.html` 管理资源加载与缓存版本。字体、图标使用现有本地资源。
- 导航由 `portal/nav.html` 桥接 OINK 菜单部件。保留移动端 PGSTY 字标与有文字标签的抽屉，
  检查搜索、语言切换和主题控件在窄屏中的可用性。
- 主题状态由 `static/js/landing-v3.js` 的 `PGSTYPortalTheme` 管理，唯一存储键为
  `pgsty-landing-theme`；默认浅色，只有 Auto 跟随系统。保持 `data-theme` 与
  `data-bs-theme` 同步，不额外加载 OINK `dark-mode.js` 或引入第二套主题状态。
- 搜索使用同源、按语言分开的 OINK 索引。`portal/palette.html` 与
  `assets/js/portal-palette.js` 负责桥接；索引、排序和对话框行为由主题提供。
- 常规页面共用 `head-meta`、`head-assets`、`nav`、`footer`、`foot-scripts`；
  `404.html` 自行组织 head，不能假定它也经过 `head-meta`。
  `portal/contact-band.html` 当前读取 `page` 和公司邮箱，旧调用传入的 title / desc 并不生效。

## 内容与事实

- 公司身份、联系方式、注册日期、注册地址从 `data/company.yaml` 读取；来源和核对日期也在其中。
  不把其中记录的核对日期描述为本轮重新核验。注册地址不等于办公地点，Pigsty 项目始于 2018
  不等于公司成立于 2018。
- 使用可核对的项目仓库与官方文档，不编造客户、证言、团队规模、认证、合作关系、付款功能或 SLA。
  不添加未经证实的商标注册标识或声明。
- 每个项目按自己的许可证分发，例如 Pigsty 为 Apache-2.0、Silo 为 AGPL-3.0；
  不将整个软件组合统称为 Apache-2.0。
- 价格与支持目标以 `pricing.yaml`、`services.yaml` 为源；具体范围、交付、费用及服务条件按书面约定。
  当前流程为咨询、报价与范围确认、协议及发票、远程交付，不存在在线信用卡结算。
- 版本、星数与扩展数量必须核实后才能作为当前事实展示；常规文案改动不顺便刷新全部指标。
  下云计算器是带日期与假设的示例模型，不是实时云报价或节省承诺。
- 中文术语：self-hosted = 自建，cloud exit = 下云，observability = 可观测性。
  隐私文案应与实际静态网站、站内搜索和本地偏好存储一致；当前 Google Analytics 已禁用。
- 保持有用的既有路径与锚点：首页 `#postgres #infras #glass #graphics #service #toolbox #yours #contact`；
  关于页 `#missing-i #timeline #small #company`。有意迁移时同步链接并提供合理兼容。

## 开发与检查

```sh
make d                    # 使用相邻 ../oink 开发；默认 make 也是此模式
GOWORK=off make s          # 使用 go.mod 固定的主题预览
GOWORK=off make b          # 构建到 public/
GOWORK=off make c          # 模块校验、严格构建、品牌声明与站内链接检查
```

- 可用 `PORT=1314` 指定空闲端口，`BIND` 默认 `127.0.0.1`；不要占用或重启用户已有预览。
  `make d` 支持 `THEME_DIR`，会显式替换主题。被忽略的本地 `go.work` 也指向 `../oink`，
  因此仅运行 `make s` / `make b` 不能保证使用固定版本，验收时使用 `GOWORK=off`。
- `go.mod` 当前声明 Go 1.27.0，`hugo.yaml` 要求 Hugo Extended 至少 0.160.1。
  `.github/workflows/pages.yml` 当前安装 Hugo 0.164.0、Go 1.26.6；Go 与模块声明存在版本差异。
  记录实际验证版本，不能据本机较新版本通过就声称 CI 已通过，也不要在无关任务里自动升级依赖。
- `make c` 先执行 `go mod verify`，再以路径、国际化警告及 `--panicOnWarning` 构建，
  最后执行 `bin/check_brand_claims.py` 和 `bin/check_internal_links.py public`。
  品牌检查只筛查不实商标声明；链接检查覆盖生成的 HTML、Markdown、LLMS 站内目标，
  不访问外站，也不代替浏览器交互或公司事实核验。
- 修改页面、数据、样式、脚本或配置后运行上述固定主题检查；涉及共享界面时再检查中英文、
  桌面和窄屏、浅深色、菜单、搜索、语言切换及受影响的计算器。按实际影响选择检查范围。
  纯维护文档改动检查路径、引用与 `git diff --check`，无需重复整套界面测试。
- 有意升级主题时才运行 `make update-theme`，审查 `go.mod` / `go.sum` 并重新验证。
  本站的局部调整优先留在本仓库，不自动修改相邻 OINK 或其他站点。

## 交付边界

- 保留已有未提交内容，不自动 stash、reset、clean 或覆盖他人工作；不因历史方案要求而启动外部模型复核。
- `public/`、`resources/_gen/`、`tmp/`、本地 `go.work*` 是忽略内容；预览与检查产物不要加入提交。
  临时证据复用一个明确目录，不复制整套仓库，也不批量删除已有临时资料。
- 仓库中的 GitHub Pages 工作流在推送 `main` 或手动触发时构建部署；README 另记录了
  Cloudflare Pages 配置，实际平台设置与发布结果需现场核对。不要由历史记录推断当前线上状态。
- 本地修改、验证、提交、推送、部署和公开页面验证分别报告；常规编辑不自动发布。
  完成用户已授权的范围，不将旧文档里的审批或分期计划变成额外门槛。
