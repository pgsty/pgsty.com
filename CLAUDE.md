# PGSTY Portal (pgsty.com)

公司门户站：Hugo + Docsy，脚手架复制自 ~/pgsty/silo.pgsty.com。
英文 `/`，中文 `/zh/`。首页是唯一核心页面。

## 命令

- `make dev` — 本地预览（hugo server）
- `make build` — 生产构建（--minify --cleanDestinationDir）
- `make check` — 严格构建（--panicOnWarning）+ bin/check_internal_links.py
- `bin/metrics.py update` — 刷新 data/portal 里的 GitHub 星数

推到 main 触发两条流水线：`.github/workflows/cloudflare.yml` 构建后强推 `gh-pages`
分支（Cloudflare Pages 接该分支）；`.github/workflows/github-pages.yml` 用
`--baseURL` 覆盖成仓库名子路径后经 artifact 部署到 GitHub Pages。两者都不配自定义域名。

## 关键约定

- 首页布局在 `layouts/index.html`，**不走 Docsy 模板**，双语用 `{{ if $zh }}` 内联；
  数据从 `hugo.Data.portal.*` 读取（注意：`.Site.Data` 已在 Hugo 0.156 弃用）。
- 页面信息架构 = P·I·G·S·T·Y 六字母专题板块（锚点 #postgres #infras #graphics
  #service #toolbox #yours），hero 蜂窝与之一一对应；每个板块以 `.lhx`
  迷你六边形字母章开头，序号 01–06 即字母顺序，勿改排序。
- 定价独立成页 `/price/`（layouts/_default/price.html + content/price*.md，
  注意 zh 内容文件**不能**写 `url:`，否则覆盖语言前缀导致双语同路径冲突）；
  首页 S 板块只留 `.price-teaser` 引导条。档位/对照表/FAQ 数据全在
  data/portal/pricing.yaml（tiers / matrix / faq）。
- 页面公共部件在 layouts/_partials/portal/{head-assets,nav,footer}.html，
  nav 以 `dict "page" . "active" "home|price"` 调用。
- 实体按语言拆分：英文站只写 PGSTY PTE. LTD.（新加坡），中文站只写
  海口龙华辟技数据中心 —— 见模板顶部 `$entity` 变量，涉及 eyebrow、
  JSON-LD、About 实体卡与页脚版权。
- 样式分两层：`static/css/landing-v3.css` 是家族设计系统（Pigsty Landing v3，
  与 pigsty.cc / silo.pgsty.com 共享，token 与品牌六色勿改）；门户组件全部在
  `static/css/portal-v1.css`。CSS 用内容 md5 做缓存指纹（见 index.html head）。
- hero 蜂窝主板：`.hex` 用负 margin 居中，**不能用 transform 居中**
  （`.anim` 入场动画会覆写 transform）。
- 主题切换 localStorage key：`pgsty-landing-theme`。
- 内容数字（价格 / 服务 / 指标）以 pigsty.cc/price、pigsty.io/price 与
  pigsty.cc/docs/about/service 为准，改动需同步。
- 文档章节（layouts/docs 等 Docsy chrome）是 silo 带来的休眠设施，当前无内容；
  若启用文档需先清理其中的 SILO 品牌残留（layouts/_partials/footer.html、
  head-end hook、head-css 等）。

## 公司事实（写文案时用）

- PGSTY PTE. LTD.（新加坡，全球业务）+ 海口龙华辟技数据中心（中国大陆，
  统一社会信用代码 92460000MAG0XJ569B）。
- PIGSTY® / PGSTY® 为注册商标；创始人冯若航（@Vonng），奇绩创坛 S22。
- 商务邮箱 rh@vonng.com；微信 RuohangFeng。
