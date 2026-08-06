# PGSTY Portal — pgsty.com

PGSTY 公司门户网站（[pgsty.com](https://pgsty.com)）：介绍公司、开源项目矩阵、专业服务与订阅价格。
双语站点：英文在 `/`，简体中文在 `/zh/`。

基于 Hugo + Docsy 框架（脚手架沿用 [silo.pgsty.com](https://github.com/pgsty/silo.pgsty.com)），
首页为完全自定义的落地页（Pigsty Landing v3 设计系统 ——「通电的主板」）。

## 本地开发

需要 Hugo Extended（>= 0.155）、Go、Node.js 与 npm：

```bash
npm ci        # 安装 PostCSS 工具链（仅 Docsy 文档页需要）
make dev      # http://localhost:1313
```

构建与检查：

```bash
make build    # 产出到 public/
make check    # 模块校验 + 严格构建 + 内链检查
```

## 部署

推送到 `main` 触发两条独立流水线（`.github/workflows/`）：

| 工作流 | 产物 | 线上地址 |
|--------|------|----------|
| `cloudflare.yml` | 构建后强推到 `gh-pages` 分支 | Cloudflare Pages 接该分支，默认 `*.pages.dev` |
| `github-pages.yml` | 以 Actions artifact 直接部署 | `https://pgsty.github.io/pgsty.com/` |

两者用同一份源码，区别只在 baseURL：Cloudflare 沿用 `hugo.yaml` 里的 `https://pgsty.com/`；
GitHub Pages 带仓库名子路径，故构建时用 `--baseURL` 覆盖（模板一律走 `relURL`，子路径无碍）。
Pull Request 只跑 Cloudflare 那条的构建与内链检查，不部署。

一次性设置：Cloudflare Pages 新建项目接本仓库、生产分支选 `gh-pages`、构建命令留空
（产物已是静态文件）；GitHub 仓库 Settings → Pages 的 Source 选 **GitHub Actions**。

## 结构速览

| 路径 | 说明 |
|------|------|
| `layouts/index.html` | 首页（完全自定义，双语内联） |
| `layouts/404.html` | 404 页 |
| `static/css/landing-v3.css` | 家族设计系统基座（勿动 token） |
| `static/css/portal-v1.css` | 门户专属组件（蜂窝主板 / 注册表卡 / 价格卡等） |
| `static/js/landing-v3.js` | 交互（主题切换 / 复制 / 滚动显现 / 计数） |
| `data/portal/*.yaml` | 首页数据：projects / sites / services / pricing / metrics |
| `static/fonts/` | 自托管字体（Chakra Petch / IBM Plex Mono / Noto Sans SC），零第三方请求 |

## 内容维护

- **改项目 / 服务 / 价格**：直接编辑 `data/portal/*.yaml`，无需动模板。
- **刷新 GitHub 星数**：`bin/metrics.py update`。
- **价格数据来源**：与 [pigsty.cc/price](https://pigsty.cc/price) 与 [pigsty.io/price](https://pigsty.io/price) 保持一致。

© 2018-2026 PGSTY PTE. LTD. / 冯若航（Vonng）
