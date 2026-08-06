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

推送到 `main` 触发 `.github/workflows/cloudflare.yml`：Hugo 构建（baseURL 沿用
`hugo.yaml` 里的 `https://pgsty.com/`）→ 内链检查 → 强推产物到 **`page`** 分支
（orphan，不留历史）。Cloudflare Pages 接该分支，用默认 `*.pages.dev` 域名。
Pull Request 只跑构建与检查，不部署。

一次性设置：Cloudflare Pages 新建项目接本仓库，生产分支选 `page`，构建命令留空
（产物已是静态文件）。

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
