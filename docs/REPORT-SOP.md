# 公开指标报告维护 SOP

## 最近一次全量清点：2026-10-26

公开快照 `20261026T061354Z-94730a1e`，19 份当前报告共用 7 类来源。
本轮调用各来源原有采集器并入库，没有新增定时任务或重新启用已停采的 Cloudflare 画像。

| 来源 | 本轮可用范围 | 口径与限制 |
|---|---|---|
| GitHub | 10 月 26 日采集时刻 | 62 个公开仓库、Star 历史、版本/资产下载及同行比较；组织 11,830 Stars |
| Docker Hub | 10 月 26 日采集时刻 | 7 镜像累计 5,743,210；Silo=minio+silo，共 4,798,842；mc 独立 |
| GA | 完整日到 10 月 25 日 | 26 公开绑定；直接日/月/年与去年同期查询；年内活跃访客合计465,408，跨站未去重 |
| Cloudflare | UTC 完整核心日到 10 月 25 日 | 26 日部分值；core/overview独立；58天历史overview缺口保留 |
| CDN | 两区域完整到 10 月 24 日 | 25日每区域15个小时对象已入库，26日对象尚未产出；保留部分日 |
| Nginx | 10 月 26 日采集时刻 | 原日志字节增量，当前日部分值，解析错误0 |
| 行业 | 10 月 26 日检查 | 63公司；14已核实、164历史、106候选；官方站点403及公告日期冲突保留 |

逐来源指标族、表、覆盖范围、报告依赖与完整对账证据在本机
`~/.local/share/repoort/verification/refresh-20261026/`。历史档案保留原观察日期，不能称为今日数据。
下一次更新仍按下方完整流程重新采集、归档、构建、推送和公网验收，不复用本表的静态数字。

英文 `/report/`，中文 `/zh/report/`；通过公司菜单进入。两页共用一份公开静态快照，
语言入口保留报告和筛选。采集、指标口径与报告代码由 `~/pgsty/repoort` 维护。

用户要求修改时先完成本地构建、导出、双语预览和验收；只有明确要求“正式发布”时，
才创建新的固定公开数据归档、更新 `data/report_publication.json`、推送并部署。
正式发布必须更新 PGSTY 报告源码与数据包，不能只更新本地 HTML 或只推前端沿用旧快照。

GA 默认“全部”，相加全部公开站点 / Property 的同日 / 同月指标；整月活跃用户只相加
各站直接整月查询值，注明跨站未去重。保留单站下钻；平均会话时长按会话数加权，缺口不补零。

年度受众使用直接 GA year 查询，不相加月活；完整年同比比较全年，当前年同比另取去年
同一截至日期窗口。发布前执行 `./report update ga-yearly` 刷新年度数据及独立采集日期。
导航入口为“关于公司 → 数据报告”，英文为“Company → Data Reports”。

增长摘要与来源数据同包发布。Silo 项目拉取合计 `pgsty/minio + pgsty/silo`，保留成员值，
`mc` 单列；项目合计不能再次与成员仓库相加。首屏、项目筛选、镜像明细和 CSV 使用同一口径。
固定站点组同比采用相同绑定与相同截止日期；季度分发只比较三个完整月。

来源更新保留真实覆盖：Cloudflare 当前 UTC 日、CDN 尚未到齐的小时和 GA 当前月标记为
partial；历史保留期缺口不补零。行业抓取失败与公告日期冲突单独保留，不因页面发布清除。

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
./report update ga-yearly
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
