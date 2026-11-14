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

## 2026-10-27 数据更新

本次快照为 `20261027T130149Z-0fa1d5a5`，生成于 2026-10-27 21:03 UTC+8。
七类来源已重新获取、入库，并重新直接查询年度 GA 和去年同期；未新增定时任务。
GitHub 11,887 Stars、300,574 次资产下载；Docker Hub 6,011,812 次拉取，
其中 Silo=minio 2,774,772+silo 2,251,095，共 5,025,867，mc 单列。
GA 年内活跃用户合计 473,193、去年同期 54,544，均截至 10 月 26 日，跨站未去重。
GA/Cloudflare 完整日截至 10 月 26 日；CDN 完整至 25 日，26 日两区域各 21 个小时对象，
保持部分覆盖；Cloudflare/Nginx 的 27 日与当前月也保持 partial。58 个历史 overview 缺口、
行业 HTTP 403 和公告日期冲突继续保留。
数据归档：<https://github.com/pgsty/pgsty.com/releases/tag/report-20261027T130149Z-0fa1d5a5>。
来源与数据库 137 项对账、103 项 Python 测试、前端完整性测试和 38 个双语构建视图已通过。
更新、归档、部署和公网验收收据位于 `~/.local/share/repoort/verification/refresh-20261027/`。

## 2026-10-28 数据更新

本次快照为 `20261028T044440Z-2915e70f`，生成于 2026-10-28 12:45 UTC+8。
七类来源已重新获取并入库，年度 GA 重新直接查询到 10 月 27 日；未新增定时任务。
GitHub 11,912 Stars、307,040 次资产下载；Docker Hub 6,156,883 次拉取，
其中 Silo=minio 2,840,892+silo 2,307,263，共 5,148,155，mc 单列 932,376。
GA 年内活跃用户合计 480,369、去年同期 54,957，均截至 10 月 27 日，跨站未去重。
Cloudflare 完整日截至 10 月 27 日，28 日为 partial；CDN 完整至 26 日，27 日两区域各 13 个小时对象，
保持部分覆盖；Nginx 更新至 28 日 partial，解析错误为 0。58 个历史 overview 缺口、行业 HTTP 403
和公告日期冲突继续保留。
数据归档：<https://github.com/pgsty/pgsty.com/releases/tag/report-20261028T044440Z-2915e70f>。
来源与数据库 170 项对账、103 项 Python 测试和 38 个双语构建视图已通过。
更新、归档、部署和公网验收收据位于 `~/.local/share/repoort/verification/refresh-20261028/`。

## 2026-11-07 数据更新

本次公开快照为 `20261107T123740Z-fb622cfc`，生成于 2026-11-07 20:38 UTC+8；19 份当前报告共用同一公开包。
七类来源按当天实际观测刷新；复用 20:00 GA 与 20:30 CDNStat 原有结果，
年度 GA 另行直接查询到 11 月 6 日，并与 2025 年 11 月 6 日做同期比较。

- GitHub：75 个公开仓库、12,215 Stars、353,124 次版本资产下载，完整 Star 历史与比较样本对账通过。
- Docker Hub：7 个公开镜像累计 8,462,187 次拉取；Silo=minio+silo，为 7,072,472，mc 独立。
- GA：10 月整月活跃用户合计 202,741；2026 年内合计 648,119，去年同期 60,137，跨站未去重。
- Cloudflare：完整 UTC 日到 11 月 6 日，7 日为 partial；只更新账号日 core/overview，历史 overview 缺口保留。
- CDN：两区域完整到 11 月 5 日；6 日每区域已到 21 个小时对象，保持 partial。
- Nginx：更新至 11 月 7 日，当前日 partial，原采集器解析错误为 0。
- 行业：63 公司、14 已核实事件、164 历史事件、106 候选；Couchbase 官网获取失败与 LibreChat 公告日期冲突继续显示。

修复 GA 跨月时丢失空查询完成证据的问题：同一公开绑定保存历史成功窗口，
9 月 60,363 UV 与 10 月 202,741 UV 均保持完整月，10 月环比恢复；11 月仍为 partial。
没有修改任何原始观测值，绑定变更不继承旧证明，新增三个语义回归测试。

112 项 Python 测试、前端完整性测试、136 项来源/数据库核对及 38 个双语构建视图通过。
构建使用生产基线 OINK 1.3.0、Hugo Extended 0.166.0、Go 1.27.0；未发布本机尚未合入的主题升级。
本次未预先保存 CDN/Nginx 逐小时/字节增量账本，未声称完成这些增量逐行检查；
已核对账本总量、日/月汇总、源表、快照 hash 和 Nginx 解析错误。

公开数据归档：<https://github.com/pgsty/pgsty.com/releases/tag/report-20261107T123740Z-fb622cfc>。
更新、归档、部署和公网验收分别存于 `~/.local/share/repoort/verification/refresh-20261107/`。

## 2026-11-13 数据更新

本次公开快照为 `20261113T141439Z-2fb879ed`，生成于 2026-11-13 22:15 UTC+8；19 份当前报告共用同一公开包。
GitHub、Docker Hub 与行业来源按 11 月 13 日重新采集；GA、Cloudflare、CDN 与 Nginx 使用截至当天已成功写入的最新来源数据，未新增定时任务。

- GitHub：76 个公开仓库、12,374 Stars、941 Forks、382,126 次版本资产下载。
- Docker Hub：7 个公开镜像累计 9,968,333 次拉取；Silo=`minio+silo`，共 8,338,854，`mc` 单列。
- GA：26 个公开绑定；10 月整月活跃用户 202,741，11 月截至 11 月 12 日的当前值为 149,530，但仍是未完成月；2026 年累计 648,119、去年同期 60,137，年度缓存截至 11 月 6 日。
- Cloudflare：完整 UTC 日到 11 月 12 日，13 日为 partial；只保留账号日 core/overview，历史 overview 缺口继续保留。
- CDN：两区域完整到 11 月 11 日；12 日仍是每区域 21 个小时对象，11 月月度记录保留 `observed_end` 和 partial。
- Nginx：完整到 11 月 12 日，13 日为 partial，原采集器解析错误为 0。
- 行业：63 公司、14 已核实事件、164 历史事件、108 候选；原有官方站点获取失败与公告日期冲突继续显示。

年度 GA 直接查询在本轮遇到 Analytics Data API 读取超时，旧年度缓存安全保留并在页面带有独立的 `as_of` / `captured_at`，没有把旧年度值伪装成 11 月 13 日新数据。月度 GA 仍按直接整月查询值相加，跨站不去重。

未完成月份的图表现在对涉及 partial 行的连线使用橙色虚线，并使用空心点；完整区间的面积填充不延伸进 partial 区间。图例、悬停提示、表格标记和 `observed_end` 同时说明覆盖状态；摘要指标优先显示最近完整月，避免把 11 月尚未结束的活跃用户误读为整月下跌。11 月及其他未完整月份不参与完整月同比/环比比较。

66 项来源/数据库核对、112 项 Python 测试、前端完整性测试和生产基线构建通过后再执行公网验收。数据归档为 <https://github.com/pgsty/pgsty.com/releases/tag/report-20261113T141439Z-2fb879ed>；更新、归档、部署和验收证据位于 `~/.local/share/repoort/verification/refresh-20261113/`。

## 2026-11-14：增加 Vonng 个人 GitHub Stars 报告

本轮在同一份公开数据包中增加独立报告 `github-vonng`，入口为
`/report/#report=github-vonng` 和 `/zh/report/#report=github-vonng`。数据来自 GitHub
公开 API，范围是用户 Vonng 名下的 119 个公开仓库，包含 fork 并在仓库表中标记；不发布
Star 用户身份、权限、私有仓库或个人资料字段。采集快照截至 2026-11-14：26,838 Stars、
5,222 Forks，其中 49 个仓库当前有 Star；保留的 Star 月度历史从 2015-05 到 2026-11。

2026-11 月尚未结束，个人报告中的当前月使用橙色虚线和空心点，并在图例、说明和当前月
标记中明确为 partial；月度总量是当前仍保留仓库的 Star 累计，不跨仓库去重，也不解释为
历史日期的实时净计数。报告共 20 份、32 个数据分片，固定公开归档为
<https://github.com/pgsty/pgsty.com/releases/tag/report-20261114T012654Z-ba45a6df>，manifest
SHA-256 为 `23fce6a9462fa058ccc276575dc60d6d066ea5ed0432c7d3360e7fa2cd356ef4`。

本地 `./report check`、113 项 Python 测试、前端完整性测试以及 OINK 1.5.1 / Hugo Extended
0.168.0 / Go 1.27.3 生产基线构建通过。官网提交 `c67387b` 已推送 `main`；GitHub Actions
run `43542494391` 的 build/deploy 与 Cloudflare Pages check-run `35b4d61f-d6c6-4cff-8fcd-58a8169d0ef5`
均为 success。普通 HTTPS 已核对中英文页面、manifest、32 个分片、SRI 和数据重建；实际生产
客户端 40 个双语视图通过，个人报告的当前数值、partial 图例、虚线和空心点均已检查。证据目录
为 `~/.local/share/repoort/verification/refresh-github-vonng-20261114/`。

## 2026-11-14：将个人 Stars 合并到 GitHub Star 总览

上一版单独的 Vonng 个人报告不符合页面组织方式，本次以新快照替换为 GitHub 页面内的
`GitHub Star 总览`。左侧只保留“开源社区 → GitHub 仓库与 Stars”；该页面向下展示个人仓库、
PGSTY 组织和两者合计三条月度走势，并在图例和当前值中分别标明三者。

公开数据目录恢复为 19 份当前报告，固定归档为
<https://github.com/pgsty/pgsty.com/releases/tag/report-20261114T032639Z-45dceb15>；32 个分片
共 33,331,884 bytes，manifest SHA-256 为
`8b491fa738b0c7d60ae999832272aaa6dce27a18baedefb21745b928db20eb75`。三条线从两边都有历史的
2018-01 开始，2026-11 当前值分别为 26,838、12,378 和 39,216；当前月仍为 partial，三条
连线均使用橙色虚线和空心点。图表不把组织早期没有观测的月份补成 0。
