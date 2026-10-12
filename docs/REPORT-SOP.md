# 公开指标报告维护 SOP

英文 `/report/`，中文 `/zh/report/`；通过公司菜单进入。两页共用一份公开静态快照，
语言入口保留报告和筛选。采集、指标口径与报告代码由 `~/pgsty/repoort` 维护。

完整更新、归档、部署、验收与回退步骤保存在
[Repoort 官网发布 SOP](/Users/vonng/pgsty/repoort/docs/PUBLISH_PGSTY.md)。

## 本仓库维护范围

- 双语正文：`content/report.md`、`content/report.zh.md`，同一 `translationKey: report`。
- 页面：`layouts/_default/report.html`；沿用官网 head-meta、导航、搜索、主题与页脚。
- 数据发布：`layouts/_partials/report/manifest.html`，按 `data/report_publication.json`
  下载固定公开 Release，校验 SHA-256 后发布到同源 `/report/manifest.json` 与 `/report/data/`。
- 前端源码副本：`assets/report/`，通过 Repoort 的 `./report export` 更新。
  dashboard.css 导出时限定在 `.repoort-app`，避免影响公司网站其他页面。
- 菜单：`hugo.yaml` 两种语言 `company-report`。原 `/impact/` 页面继续保留自身内容。
- 生成数据：`static/report/` 已忽略，禁止提交；生产指针发布的 JSON 分片也不进入 Git。

## 一次更新

```sh
cd ~/pgsty/repoort
./report daily
./report check
python3 -m unittest discover -s tests -v
./report export --site ~/pgsty/pgsty.com
cd ~/pgsty/pgsty.com
HUGO_REPOORT_USE_LOCAL=1 GOWORK=off make c
HUGO_REPOORT_USE_LOCAL=1 GOWORK=off make s PORT=1317
```

在发布工作区执行 `./report export --site "$SITE_RELEASE"`、
`./report release --site "$SITE_RELEASE" --repo pgsty/pgsty.com`，然后普通
`GOWORK=off make c` 会从远程归档重新校验数据。明确审查和提交报告相关源文件与指针，
正常推送 main，等待既有 Cloudflare Pages / GitHub Pages 构建成功，再验收两个公网入口。

只构建用 `./report build all`；不因发布重新创建 GA/CDN 定时采集。日常本地更新不会自动
改变公网快照。每个来源日期与 partial / stale 独立展示，页面生成日期不能代替来源日期。

回退以新提交恢复上一发布指针，正常部署和验收，保留所有固定数据归档。
公司网站有其他未发布修改时，用独立 codex 分支和 Git worktree 隔离本次交付，
不得 reset、stash 或整树覆盖原工作区。

本机若使用现有 HTTPS_PROXY，远程归档构建需加 `HUGO_SECURITY_HTTP_PROXYFROMENVIRONMENT=true`，
例如 `HUGO_SECURITY_HTTP_PROXYFROMENVIRONMENT=true GOWORK=off make c`。这是本机出网设置，
不加入官网生产配置；Cloudflare/GitHub 构建直接访问固定公开附件。
