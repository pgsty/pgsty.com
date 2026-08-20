# pgsty.com 公司官网 PRD v3 —— 以 Percona 为范本的公司站信息架构

| 项目 | 内容 |
|---|---|
| 版本 | v3.1（2026-08-18；v3.0 同日初稿，v3.1 并入 Percona 30 页抓取、生态站点普查与本站素材清单三份研究） |
| 范本 | https://www.percona.com/（2026 改版后「Unshittification」定位的站点，含 sitemap 抓取） |
| 取代 | PRD v2（2026-08-06）§4–§7 的信息架构与页面清单；**保留** v2 的全部红线（数字单源、实体拆分、术语、TODO 规则、Keeper lines） |
| 站点 | Hugo + OINK；英文 `/`，中文 `/zh/`；GitHub Pages + Cloudflare Pages 双链部署 |
| 状态 | 待拍板（§15 待决问题 Q1–Q22）→ 分期实施（§13） |

---

## 0. 一句话结论

**首页减重，栏目承重。** 现在的 pgsty.com 是一张 605 行的长首页 + 三个附属页（/price/、/about/、/solutions/cloud-exit/），
所有内容堆在首页六个字母板块里；企业买家想核对「你们卖什么、怎么服务、多少钱、可信吗、找谁」，要在一页里上下翻。
Percona 的做法是六个语义栏目（Database Technology / Services / Use Cases / Resources / Community / Company），
每栏一个 hub，页面模板化，产品 ↔ 服务 ↔ 场景 ↔ 资源交叉链接，每页尾部固定「证言 → 资源 → FAQ → 终 CTA」；
首页顺序是 **理念 → 服务 → 场景 → 软件**——软件免费的公司，把「我们信什么、怎么服务」放在「我们有什么」前面。

v3 把 pgsty.com 改成同一种骨架：**Products / Services / Solutions / Pricing / Resources / Company** 六栏（+ GitHub + 主 CTA），
首页只做总览与导流；六字母 PIGSTY 板保留为首页叙事装置和锚点，不再是站点结构本身。现有的 hero、三岔路口、指标带、
下云账本、价格矩阵、关于页、Keeper lines 全部保留并下沉到对应栏目。与 Percona 的两处刻意不同：**价格继续公开**
（Percona 全站无价格页，是我们的差异化优势），**计算器继续给真数字**（Percona 的 Calculator 是六步问卷式线索表单）。

---

## 1. 背景与目标

### 1.1 现状诊断（2026-08-18）

| 维度 | 现状 | 问题 |
|---|---|---|
| 页面数 | EN/ZH 各 5 页：`/` `/price/` `/about/` `/solutions/` `/solutions/cloud-exit/`（+ `/company/about/` 别名） | 没有产品页、服务页、联系页、法务页、信任页、案例页、新闻页 |
| 首页 | hero + doors + metrics + P/I/G/S/T/Y 六大模块（每块含完整清单 + 代码板）+ About teaser + FAQ + contact band，605 行 | 一页承载全部信息；导航里 Services / Values / Infrastructure / Observability / Toolbox 都是首页锚点 |
| 导航 | Product▾（发行版↗ / Silo↗ / PGEXT↗ / 基础设施# / 可观测性# / 工具箱#）· Solutions（直指 cloud-exit）· Services# · Pricing · Company▾（About / Values# / Contact#）· Docs↗ | 一半菜单项是 `#锚点` 或外链；**导航有两处真源**：`nav.html` 硬编码 vs `hugo.yaml` `menu.main`（后者生成 llms.txt） |
| 转化 | 全站 CTA 归到 `mailto:rh@vonng.com` 与 `#contact` | 没有独立联系页、表单、预约、微信二维码承载页；30 天企业试用只在 ZH 价格注释里 |
| 社会证明 | 无客户 logo、无证言、无案例；pigsty.io/cc 首页已有 12 家 logo + Tantan 引言 | 企业买家最想看的一块是空的 |
| 信任/法务 | 无 Terms / Privacy / 支持政策 / 安全披露 / security.txt / 生命周期政策；「Service Terms」外链到 pigsty.io 文档 | 采购与合规流程走不下去；Percona 有 14 个法务页 + Security Center |
| 资源 | 文档、博客、下云文选全外链（pigsty.io/cc、vonng.com）；`sites.yaml` 六个站点条目已写好但**无处渲染**；`content/*.md` 正文只进 .md/LLMS 输出，人看不到 | 公司站没有资源中心；已有素材闲置 |
| 数据层 | brand / pricing / services / projects / sites / cloudcost / home 七个数据文件，单源规则已落地 | 缺 nav / products / solutions / customers / news / talks / compare / legal 数据 |
| **跨站口径** | 扩展数：pgsty.com 572 · pigsty.io/cc 575 · ext.pgsty.com 576/2,241；星数 5,510 / 5,465 / 5,521；企业版响应 pigsty.cc/price「30 分钟」vs pigsty.cc/docs/about/service「<1h」且档位定义不同；ZH 主体 pgsty.com 写 1 家、pigsty.cc 服务页写 3 家 | 单源规则在仓库内成立、跨站不成立；访客并排开两个 tab 就能看到矛盾（详见附录 D） |

### 1.2 目标

1. **企业买家 5 分钟内能回答五个问题**：你们有什么（Products）、怎么服务（Services）、解决我什么问题（Solutions）、
   多少钱（Pricing）、可信吗 / 找谁（Company · Resources）。每个问题一个顶层栏目，一次点击到达。
2. **首页变总览**：每栏在首页只留一段卡片 + 一个「了解更多」；深内容全部下沉；模板 ≤ 400 行。
3. **模板化**：五种页面模板复用，新增一页 = 新增一个数据条目 / 一个 content 文件。
4. **交叉链接**：产品页链服务与场景；服务页链档位与场景；场景页链产品、服务、账本；页尾统一 FAQ + CTA。
5. **保留全部可用素材**：hero 字母板、三岔路口、指标带、下云账本与计算器、价格矩阵、关于页三段叙事、Keeper lines、
   projects / sites / cloudcost 数据；已有 `content/*.md` 正文纳入渲染或裁掉。
6. **双语本地化不翻译**：中文站有自己的方案页（信创、去 O）、实体、联系方式、支付方式。
7. **跨站口径统一**：pgsty.com 成为商务口径（价格、SLA、主体、政策）的**唯一权威页**，产品站只做摘要 + 链接。

### 1.3 非目标

- 不把 pigsty.io/cc 的文档与技术博客搬到 pgsty.com（文档 = 产品站；公司站只做入口 + 新闻公告）。
- 不做 Kubernetes Operator、托管运维（ExpertOps 类）、Training 等 PGSTY 尚未实际提供的服务页（除非 §15 拍板）。
- 不编造客户、证言、SLA、认证、里程碑年份、合作伙伴；待确认事实留在数据占位或源码注释，公开页面不渲染 `TODO`。
- 不引入第二套设计系统；继续 landing-v3 + portal-v1 两层 CSS 与 OINK 主题。
- 不复制 Percona 的「每引擎一棵页面树」；PGSTY 单数据库，产品轴按产品族分。

---

## 2. Percona 官网解剖（范本研究结论）

抓取 30 页：`/`、`/postgresql/`、`/postgresql/software/`、`/postgresql/support/`、`/postgresql/calculator/`、`/monitoring/`、
`/cloud-native/`、`/toolkit/`、`/downloads/`、`/services/` 与 6 个服务页、`/solution-bundles/`、`/mariadb-support/support-tiers/`、
`/subscription-policies/`、`/use-cases/` 与 `/use-cases/cost-optimization/`、`/blog/`、`/resources/`、`/customer-stories/`、
`/training/`、`/about/`、`/partners/`、`/community/`（→ percona.community）、`sitemap.xml` 及 page / service / technology /
resource-type 子图（清单见附录 B）。`/contact-us/` 与 `/webinars/` 为 JS 渲染，未能读到表单字段与归档 UI。

### 2.1 全局导航（6 栏 + 2 CTA，无 Pricing）

| 栏目 | 下拉内容 | 备注 |
|---|---|---|
| **Database Technology** | PostgreSQL / MySQL / MariaDB / MongoDB / Valkey-Redis，每引擎固定四件套：概览 · Software · Calculator · Downloads · Enterprise Support and Services；另加 Databases on Kubernetes · Monitoring & Management (PMM) · Percona Toolkit | 产品轴**以客户已在用的技术命名**，不以自家 SKU 命名 |
| **Services** | Solutions Bundles · Expert Support · ExpertOps · Expert Consulting and Services · Migrations · Health Audit · Architecture and Design · Performance Tuning · Security Assessment · Monitoring Quickstart · Training | 3 种持续服务 + 7 种打包工程 + 训练 |
| **Use Cases** | Cost Optimization · Performance and Reliability · Sovereignty, Security, and Compliance · AI and Future Readiness | **只有 4 个**，按业务结果分，不按行业 / 部署 / 数据库 |
| **Resources** | Docs（docs.percona.com）· Downloads · Resource Hub · Blog · Customer Stories · Webinars | 文档整体在子域，营销站不托管文档 |
| **Community** | Forum（forums.percona.com）· Community Hub（percona.community）· Events | 整体独立域名 |
| **Company** | About Percona · News · Press Releases · Partners · Careers · Contact | |
| CTA | 「Get Started」「Connect」常驻；页尾「Contact us」 | **全站没有 Pricing 页也没有 Pricing 菜单** |

### 2.2 首页九段式（自上而下）

1. Hero：「The Way Is Open」/「Open source database software from experts who stand with you in production. Forever free from lock-in and other corporate BS.」/ 单 CTA「Get Started」
2. Logo 走马灯（Netflix、Duolingo、Nokia、Adobe、Workday、Vodafone …≈20 家；几乎每个商务页复用）
3. 原则带「Principles of Unshittification」：Open Wins · Run Free · Honest Guidance · Give Back（四格，**放在产品之前**）
4. 服务带「GUIDING THE WAY」：Expert Support · ExpertOps Proactive Database Management · Expert Consulting and Services · Training
5. 场景带「SOLVE. INNOVATE. BE FREE.」：四个 Use Case 卡
6. 技术带「Database Technology: On-prem, cloud, and Kubernetes without vendor restrictions」：每引擎一卡、卡上只有 **Software** 与 **Support and Services** 两个链接（PostgreSQL 卡文案「Enterprise PostgreSQL without proprietary traps or gated costs.」）
7. 证言「What Our Customers Say」：五条**具名**引言（人名 + 头衔 + 公司：Ryanair、LeadByte、BBVA、Trend Micro、Property.ca）+「View Our Customer Stories」
8. 博客「Run Databases Better」：三篇最新
9. 终 CTA「Far Enough. / Said no pioneer ever.」+「Get Started」「Connect」

要点：**顺序 = 理念 → 服务 → 场景 → 软件**；每段只有标题 + 3–4 卡 + Learn More，没有一段展开成完整清单；首页无 Newsletter、无价格块、无对比表。

### 2.3 五种页面模板（全站复用）

| 模板 | 代表页 | 骨架 |
|---|---|---|
| **T-Hub 技术枢纽（路由页，不直接卖）** | `/postgresql/` | Hero「Percona for PostgreSQL / PostgreSQL Without Proprietary Traps」→ 三卡（Software / Services / Docs & Downloads）+ 电子书钩子「Running PostgreSQL in Production? Start Here.」→ 六格价值「Production Ready. Fully Under Your Control.」→ 客户证言（Türk Telekom）→ 计算器入口「Plan Your Optimal PostgreSQL Infrastructure」→ 四张方案卡（PostGIS / HA / AI / pg_tde）→ FAQ → 终 CTA |
| **T-Software 软件清单** | `/postgresql/software/` | Hero → 分层列表（Data layer：Distribution / Operator / pg_tde；Management layer：PMM），**每项固定两个按钮「Documentation」「Installation Options」** → 企业特性 → Community（三个 GitHub 仓库 + Forum）→ FAQ。`/cloud-native/` 每个 Operator 还固定 **GitHub · Docs · Roadmap** 三链 |
| **T-Service 服务页** | `/services/` hub + `/services/expert-support/` | hub H1「**We Don't Sell Databases. We Make Sure They Run.**」，三价值（One Stack, One Team / Real, Honest Answers / Total Freedom），十张服务卡，然后一张**三种模式对照表**：Expert Support（响应式、顾问式）/ ExpertOps（主动式、代运维）/ Expert Consulting（项目制）——整个服务栏的脊柱。Expert Support 页：四支柱「24×7 Incident Response with Defined SLAs」「Expert Troubleshooting and Diagnosis」「Advisory Guidance and Change Validation」「Multi-Database Support Under a Single Contract」；Advanced / Premium 两档只点名不对比 |
| **T-Productized 固定范围产品化服务** | `/services/database-health-audit/` `/services/database-migrations/` | **公开「Starting from」价格**：Health Audit「Starting from $11,400」（PDF 报告 5–7 个工作日 + 现场答疑；「WHO IT'S FOR」= 1–5 台服务器；「AT A GLANCE」盒：价格 + 周期；更大环境显式指向 Consulting）；Migrations「$26,000 starting from」、专有库评估 DMAT「$5,000 starting from」，含 2–4 周后复检。Solution Bundles：Scope → Execute → Hand Off 三步、无价格 |
| **T-UseCase 场景页** | `/use-cases/cost-optimization/` | Hero（问题句「Database costs don't rise on their own. Licensing creep, tiered paywalls, and constant upcharges cost more every year. We help you stop it.」+ CTA「Get Help Now」）+ logo 墙 → **点名反派**「Complexity is Expensive. And Vendors Are Happy to Profit From It.」→ 五条价值主张（每条挂回一个产品或服务）→ 客户故事（Minsait）→ 五支柱 → 三篇博客 → FAQ → 终 CTA。`/use-cases/` hub H1「Solutions Built for Your Needs. Not Investors Roadmaps.」 |
| **T-Company 公司页** | `/about/` | 「Unshittification Starts Here」→ 使命 → **三个数字**（350 team members / 52 countries / 4.2M+ downloads per month）→ 时间轴「Defending open source since 2006」→ 领导层九人 → 新闻 → 招聘 CTA |

**共用页尾**：证言 → 3 篇资源 → FAQ（统一标题「Use FAQs · Real Answers. No Corporate Doublespeak.」）→ 终 CTA「Far Enough. Said no pioneer ever.」。

### 2.4 SLA 以政策页形式公开（不在销售页）

`/subscription-policies/` 与 `/mariadb-support/support-tiers/` 才有真正的档位对照：

| 严重级别 | Advanced | Premium |
|---|---|---|
| P1 紧急（首响） | 30 min | 15 min |
| P2 高 | 90 min | 60 min |
| P3 中 | 8 h（MariaDB 页 4 h） | 4 h（2 h） |
| P4 低 | 16 h | 24 h |

外加：电话 / 聊天、顾问式支持、CSM、可选 TAM、Percona 软件热修、持续响应目标（仅 Premium）、非 Percona 软件修复（仅 Premium）、
咨询折扣 10% / 20%、技术联系人 10 / 20（政策页 50）、Premium 解决目标 P1 ≤ 24 h / P2 ≤ 48 h、2 年 EOL 顾问；
**按服务器计价、24×7×365、必须覆盖环境内全部生产库服务器**；无美元数字。—— 单位字节可信度极高、维护成本为零。

### 2.5 转化机制

- 词汇按语境变化：首页「Get Started」「Connect」；服务「Talk to an Expert」「Talk With Sales」、咨询页「**Hire Us For The Hard Work. Fire Us When It's Done.**」；场景「Get Help Now」；产品「Install Now」「Documentation」「Installation Options」「Get PMM」；内容「Get the eBook」「Download PDF」「View Customer Story」「View the Bundle」。
- 每引擎一个 **Calculator**（`/postgresql/calculator/`）：六步问卷（行业、规模、现供应商、云 / K8s 偏好、GDPR / HIPAA / SOC2 / PCI、迁移与预算），**输出推荐架构而非成本数字**，收口到「Get support building your infrastructure」——本质是穿着工具外衣的线索表单。
- 电子书 / 培训 PDF 作 lead magnet（gated）；**下载不需要注册**。
- 价格：订阅只报价（按服务器、Advanced / Premium）；**固定范围服务公开「starting from」**——「有边界的地方标价，没边界的地方报价」是全站最值得学的一条商业决策。

### 2.6 资源、社区与公司

- 博客 `/blog/`：695 页、分面（搜索、作者下拉、分类多选：MySQL 3,896 · Insight for DBAs 2,383 · MongoDB 783 · PostgreSQL 478）；无侧栏、无 Newsletter。
- Resource Hub `/resources/`「Two Decades of Database Expertise. All in One Place.」两组分面（By Technology：MySQL 14 / Percona 13 / PostgreSQL 12 …；Resource Type：Technical Presentations 64 / Datasheets 51 / Webinars 46 / eBooks 20 / Solution Briefs 13 / White Papers 11 / Case Studies 1 …），**分面带可见计数**。
- Customer Stories 独立 post type + 独立 sitemap，可按主题 / 技术筛选。
- 社区在 percona.community（「The way is Open. The climb is yours.」；Newsletter「Subscribe for open source news, community updates, and nothing else.」）+ forums.percona.com + perconalive.com。
- `/partners/`（Strategic / Channel / Technology 三级 + logo 目录）、`/careers/`（部门 × 地点分类）、`/news/`、`/press/`、`/security/`（→ trust.percona.com）。
- 法务 14 页（`/legal/` `/privacy/` `/privacy-policy/` `/platform-terms-of-service/` `/subscription-policies/` `/support-policies/` `/consulting-policies/` `/percona-services-lifecycle-policy/` `/trademark-policy/` `/copyright-policy/` `/dmca-notice/` `/data-privacy-framework/` `/article-14-notice/` `/percona-llc-form-w-9/`）+ `/release-lifecycle-overview/`。页脚含**他人商标声明**（MySQL / PostgreSQL / InnoDB / MariaDB / MongoDB / Kubernetes 归各自所有者）。

### 2.7 值得借鉴 vs. 不照搬

| 借鉴（14 条） | 不照搬（10 条） |
|---|---|
| 六栏语义导航；每栏一个 hub（路由页不直接卖） | 按数据库引擎分 hub → PGSTY 单库，按**产品族**分 |
| 首页顺序：理念 → 服务 → 场景 → 软件 | 不公开价格 → **保留 /price/**（差异化优势） |
| 服务三模式脊柱（响应式 / 主动式 / 项目制）+ hub 对照表 | 12 个服务页 → 只做实际提供的 4–5 个 |
| **固定范围服务公开「starting from」价格**，「AT A GLANCE」+「WHO IT'S FOR」+ 升级路径 | ExpertOps 托管 / Training → 未提供，不做假页 |
| SLA 以政策页公开（严重级别 × 档位 × 分钟） | 六步问卷式 Calculator → 我们的八旋钮真数字计算器**更好，保持** |
| Use Cases 只有 4 个，按业务结果分 | 20 家 logo 走马灯 → 用 2–3 条**具名引言**（人 + 头衔 + 公司 + 具体结果） |
| 页尾固定「证言 → 资源 → FAQ → 终 CTA」+ 有态度的 FAQ 标题 | 独立社区域名 → 一页 `/community/`，社区实体在 GitHub |
| 软件清单每项固定「Documentation」「Installation」（+ GitHub · Docs · **Roadmap**）+ Community 块 | Careers / Partners 分级 / 九人领导层 / W-9 → 头数不够，不做 |
| Calculator / 电子书作资源型钩子（我们已有下云计算器；下载不设门） | 窄 SEO 服务页（`/services/postgresql-pgvector-support/` 类 80% 样板）→ 稀释小站权威 |
| Customer Stories 独立路径 + 分面 | Resource Hub 32 页分面 → 起步一页卡片墙 + 类型筛选 |
| 法务 / 信任页成套 + 他人商标声明 | 12 个法务页 → 4–5 页足够，但**订阅政策页必做**（它是销售资产） |
| About「三个数字 + 时间轴」 | 695 页博客 → 只学分面 UI，不学体量野心 |
| 每页 hero 直接说人话（「Without Proprietary Traps」「Nobody books a maintenance window expecting to use the rollback plan.」） | 电子书 lead magnet 表单墙 → 我们的内容全部公开 |
| 分面带可见计数（小也诚实） | 多引擎「single contract」卖点 → 不适用 |

---

## 3. Percona → PGSTY 概念映射

| Percona | PGSTY 对应物 | 备注 |
|---|---|---|
| Database Technology（按引擎） | **Products**（按产品族）：Pigsty 发行版 · 内核与扩展 · 可观测性 · 基础设施与 Silo · 工具 | 六字母 P·I·G·T 落到这里；栏目名备选「PostgreSQL」见 Q22 |
| Percona Distribution for PostgreSQL | Pigsty（旗舰） | |
| Percona Software for PostgreSQL（分层清单） | `/products/` hub：Distribution / Data layer / Management layer / Infrastructure layer | 每项 Docs + Install（+ Roadmap） |
| PMM | GLASS（Victoria + Grafana + pg_exporter） | |
| Percona Toolkit | PIG / pg_exporter / SOW / Silo | |
| Percona Operator / Everest | —（不做） | |
| Calculator | 下云账本计算器（已有，真数字）+ 订阅档位速算（新增，轻量） | |
| Downloads | `/get-started/`（一条命令 + 离线包 + PIG + Docker + 文档入口，不注册） | |
| Expert Support（Advanced / Premium，报价） | 订阅（OSS / Standard / Professional / Enterprise，**公开价**） | pricing.yaml |
| Expert Consulting and Services | 挂专家号 / 专家咨询 / 专家顾问 | services.yaml |
| ExpertOps（主动式托管） | 无对应（订阅内含的健康检查报告是主动式成分；专家顾问的私有化部署最接近） | Q5 |
| Health Audit / Migrations / DMAT（固定范围 + starting from） | **产品化服务**：单次健康巡检 · 下云迁移评估 · HA 建设（价格待 Q5；模板见 §5 T-Productized） | 我们已有按天 / 按次价，补「固定范围 + 交付物 + 周期」 |
| Solution Bundles | 同上，合并进产品化服务 | |
| Training | 无对应 | Q5 |
| Use Cases ×4 | **Solutions**：下云（成本）· 主权与合规（信创）· 可靠性 · 迁移（去 O / MySQL→PG）· 自建 RDS/DBaaS · AI（P3） | 6 个，其中 2 个 P2、1 个 P3 |
| Resource Hub / Blog / Customer Stories / Webinars | **Resources**：文档↗ · 博客↗ · 新闻公告 · 客户 · 演讲与视频 · 计算器 · 对比 · 社区 | 博客留产品站，Q1 |
| Community（独立域） | `/community/` 一页 + 页脚栏 | |
| Company（About / News / Press / Partners / Careers / Contact） | **Company**：About · News · Contact · Trust · Legal · Brand（Partners / Careers 待拍板） | |
| Security Center（trust.percona.com） | `/trust/` + `/.well-known/security.txt` | 零遥测、签名校验、Silo 14 个 CVE 修复、披露流程 |
| Subscription / Support / Lifecycle Policies | `/legal/terms/` `/legal/support-policy/` `/legal/lifecycle/` | 从 pricing.yaml 矩阵推导，**同时消解跨站 SLA 矛盾** |
| 「Principles of Unshittification」 | Y 板块四原则（完整开源 · 本地优先 · 云中立 · 回馈社区）→ 首页原则带（第 3 段） | Keeper lines |
| 「Far Enough. Said no pioneer ever.」终 CTA | contact-band「Let's talk PostgreSQL」/「聊聊你的 PostgreSQL」+「Talk to the Author」 | 已有部件 |
| 「Real Answers. No Corporate Doublespeak.」FAQ | 统一 FAQ 标题（Q12） | |
| 「Hire Us For The Hard Work. Fire Us When It's Done.」 | 咨询页可写同调句（待用户定稿） | |
| 页脚他人商标声明 | 页脚一行：PostgreSQL / MinIO / Grafana 等归各自所有者；自家名称不加 ® | make check 已断言 |

---

## 4. 信息架构（IA）

### 4.1 顶层导航

**EN**：`Products ▾ · Services ▾ · Solutions ▾ · Pricing · Resources ▾ · Company ▾ · [GitHub ★] · [Get Started] · [Talk to the Author]`
**ZH**：`产品 ▾ · 服务 ▾ · 方案 ▾ · 价格 · 资源 ▾ · 公司 ▾ · [GitHub ★] · [快速上手] · [直接找作者聊]`

规则（承接 v2 §4.3）：
- 导航一律语义词，**不用字母序列**；字母角标只在首页 hero 与 Products 子页眉（如 `P · 01`）出现。
- 导航项全部指向**真实页面**，不再指首页锚点；外链项（Docs / Blog / GitHub）加 `↗`。
- **单一真源**：`data/portal/nav.yaml` 驱动 `nav.html`、`footer.html`，并生成 / 校验 `hugo.yaml` `menu.main`（后者供 OINK llms.txt 与命令面板），验收比对两者一致（§14）。
- 桌面端纯 CSS 下拉（现有实现），下拉内按「页面 · 一行说明」两行；移动端手风琴。
- 主 CTA 双按钮：`Get Started`（→ `/get-started/`）与 `Talk to the Author`（→ `/contact/`）。GitHub 按钮带星数（现有）。

**下拉内容**

| 栏目 | 下拉项（EN / ZH） | 目标 |
|---|---|---|
| Products / 产品 | Overview / 产品总览 · Pigsty Distribution / Pigsty 发行版 · Kernels & Extensions / 内核与扩展 · Observability / 可观测性 · Infrastructure & Silo / 基础设施与 Silo · Tools / 工具箱 · Get Started / 快速上手 | `/products/` … `/get-started/` |
| Services / 服务 | Overview / 服务总览 · Subscription & Support / 订阅与支持 · Consulting / 专家咨询 · Emergency & Migration / 救援与迁移 · Build Your Own RDS / 自建 RDS · Support Policy / 支持政策 | `/services/` … `/legal/support-policy/` |
| Solutions / 方案 | Overview / 方案总览 · Cloud Exit / 下云 · Sovereignty & Compliance / 信创与合规 · Reliability / 高可用与容灾 · Migration / 去 O 与迁移 · DBaaS / 自建 RDS · AI & Vector / AI 与向量（P3） | `/solutions/…` |
| Pricing / 价格 | （直达） | `/price/` |
| Resources / 资源 | Docs↗ / 文档↗ · Blog↗ / 博客↗ · News / 新闻公告 · Customers / 客户 · Talks & Videos / 演讲与视频 · Cloud Cost Calculator / 下云计算器 · Compare / 对比 · Community / 社区 | `/resources/` … |
| Company / 公司 | About / 关于我们 · Contact / 联系 · Trust & Security / 信任与安全 · Legal / 法务 · Brand / 品牌 | `/about/` … |

### 4.2 完整站点地图（目标态）

`P1/P2/P3` = 分期（§13）；`✓` = 现有页面；`ZH≠EN` = 中文站独立成文。

```
/                                   ✓ 首页（改版，§7）
/get-started/                       P1  一条命令 + 离线包 + PIG + Docker + 文档入口（Percona「Downloads」，不注册）
/products/                          P1  产品总览 hub（分层软件清单，T-Software）
/products/pigsty/                   P1  旗舰发行版页（T-Product）
/products/kernels-extensions/       P1  12 内核 × 572 扩展 × PGEXT × PIG（T-Product）
/products/observability/            P1  GLASS：Victoria + Grafana + pg_exporter（T-Product）
/products/infrastructure/           P1  仓库 / 离线包 / Silo 对象存储 —— 「少掉的 i」的产品页（T-Product）
/products/tools/                    P1  Silo · PIG · pg_exporter · SOW 卡片索引（各卡指向独立官网；piglet 见 Q19）
/services/                          P1  服务总览 hub（三模式对照表：订阅 / 按需专家 / 产品化服务）
/services/subscription/             P1  订阅与支持（四档摘要 + 响应矩阵 → /price/）
/services/consulting/               P1  挂专家号 / 专家咨询 / 专家顾问
/services/emergency-migration/      P1  紧急救援 · 架构升级 · 数据迁移 · 故障响应 · 数据恢复
/services/health-check/             P2  产品化：单次健康巡检（T-Productized，价格待 Q5）
/services/dbaas/                    P2  把 Pigsty 运营成你自己的 RDS / DBaaS（RDS OEM）
/solutions/                         ✓ 方案总览（改为卡片 hub）
/solutions/cloud-exit/              ✓ 下云宣言 + 账本 + 计算器（保留原样，加交叉链接与页尾）
/solutions/sovereignty/             P1  EN：sovereign / air-gapped / data residency；ZH≠EN：信创国产化（龙芯 / 国产 OS / ARM）
/solutions/reliability/             P2  HA / DR / PITR / 容量与性能
/solutions/migration/               P2  去 O、MySQL→PG、RDS→自建 的迁移方法论
/solutions/dbaas/                   P2  面向云厂商 / ISV / 大企业平台组：自建 RDS
/solutions/ai/                      P3  pgvector / AI 工作负载 / piglet（待 Q19）
/price/                             ✓ 价格（保留，成为跨站权威页；P2 加「按节点数速算档位」）
/resources/                         P2  资源中心 hub（卡片墙 + 类型筛选 + 可见计数）
/news/  /news/<slug>/               P2  新闻公告（发版 / 里程碑 / 奖项 / 政策变更；RSS）
/customers/  /customers/<slug>/     P2/P3  客户 logo 墙 + 已授权引言 / 案例（authorized:true 才渲染）
/talks/                             P2  演讲与视频（会议 / 分享 / 录像 / 奖项）
/compare/  /compare/<slug>/         P2  Pigsty vs RDS / vs Percona Distribution / vs EDB / vs Supabase 自建 …（每行带来源与日期）
/community/                         P2  GitHub · Discussions · Discord · Telegram · 微信 · pg.center · PGEXT · 贡献指南
/newsletter/                        P3  订阅（工具待定，Q7）
/about/                             ✓ 关于（保留；补「三个数字」带、奖项与赞助者、新闻块）
/contact/                           P1  联系页（邮箱主题模板 / 微信 / 时区 / 期望响应 / 分语言实体；表单待 Q6）
/trust/                             P1  信任与安全中心；/.well-known/security.txt
/legal/                             P1  法务索引
/legal/terms/                       P1  订阅服务条款
/legal/privacy/                     P1  隐私政策（GA 说明；产品零遥测）
/legal/support-policy/              P1  支持政策：严重级别 / 响应 / 服务时间 / 渠道（pricing.yaml 矩阵推导；消解跨站矛盾）
/legal/lifecycle/                   P2  支持生命周期：各档位覆盖的 PG 大版本与 OS + 上游 EOL 对照
/legal/trademark/                   P2  名称与品牌使用规范（不含任何注册状态声明）+ 他人商标声明
/brand/                             P2  Logo / 配色 / 命名（PIGSTY vs PGSTY）下载
/partners/                          P3  待有真实合作伙伴（赞助者 MiraclePlus / Vercel OSS / JetBrains 可先入 /about/，Q4）
/404.html                           ✓
```

保留别名：`/company/about/` → `/about/`；`#graphics` → `#glass`（首页）。旧首页锚点 `#postgres #infras #glass #service #toolbox #yours #contact`
**继续存在**（外链不能断），对应段落改为总览卡并各带「了解更多 →」到子页。

页面数量：EN/ZH 各约 **P1 = 20 页、P2 = +16 页、P3 = +6 页**（不含 news / customers / compare 条目页）。

### 4.3 双轴的归宿

- 纵轴「我们有什么」（六字母）→ **Products + Services**（P·I·G·T → Products，S → Services，Y → 首页原则带 + `/about/` + `/trust/`）。
- 横轴「你要干什么」→ **Solutions**。
- 首页 hero 字母板 = 纵轴的视觉索引；三岔路口 = 三种来意的快捷入口（上手 / 企业买家 / 理念读者）。

### 4.4 URL 与别名规则

- 全部小写、连字符、末尾斜杠；ZH 内容文件**不写 `url:`**；路径靠 content 目录结构。
- 变更 URL 只用 `aliases`；站内不得链接别名页（bin/check_internal_links.py 已校验）。
- 每个页面 EN/ZH 成对（hreflang 成对），ZH≠EN 的页面共用同一路径、不同文案。
- 外部产品官网不镜像：pig.pgsty.com / exp.pgsty.com / silo.pgsty.com / sow.pgsty.com / pgext.cloud 保持独立，pgsty.com 只做卡片 + 一段 + 出口。
- doc.pgsty.com 目前是完整 Pigsty 文档镜像 → 「Docs↗」指向何处见 Q18。

### 4.5 页脚（五栏 + 法务行）

| Products / 产品 | Services / 服务 | Solutions / 方案 | Resources / 资源 | Company / 公司 |
|---|---|---|---|---|
| Pigsty · Kernels & Extensions · Observability · Infrastructure & Silo · Tools · Get Started | Subscription & Support · Consulting · Emergency & Migration · Build Your Own RDS · Pricing · Support Policy | Cloud Exit · Sovereignty · Reliability · Migration · DBaaS | Docs↗ · Blog↗ · News · Customers · Talks · Calculator · Compare · Community | About · Contact · Trust & Security · Legal · Brand |

品牌块保留：logo、彩色字标、tagline、「The missing i? See About.」/「少了一个 i？见「关于」。」、口号「Run a good database — and run it well.」/「助您用好数据库，用好数据库」。
法务行：`© {since_year}–今 {entity}` · Terms · Privacy · Support Policy · Trademark · 他人商标声明一行 · ZH 站 ICP（`footer_icp` 参数，有则渲染）· 语言切换 · 社交（GitHub / Discord / Telegram / 微信(ZH) / X / LinkedIn(EN)）。
现有「开源项目 / 站点 / 服务 / 社区」四栏并入上表；`sites.yaml` 六条目落到 Resources / Community。

---

## 5. 页面模板（Templates）

所有子页仍是独立完整 HTML 布局（现有做法），但**骨架统一**、段落部件化（partials）、数据驱动。
段落 partial：`portal/hero`、`portal/cards`、`portal/pillars`、`portal/proof`、`portal/glance`（AT A GLANCE 盒）、`portal/related`、
`portal/faq`、`portal/contact-band`（已有）、`portal/nav`（已有）、`portal/footer`（已有）。

### T-Home 首页 —— 见 §7

### T-Hub 栏目枢纽（/products/ /services/ /solutions/ /resources/）—— 路由页，不直接卖
1. Hero：栏目名 + 一句定位 + 两个 CTA
2. 分层 / 分组卡片列表（每卡：名称 · 一句话 · 两个链接[了解更多 / 文档或价格]）
3. 「怎么组合」一段或一张对照表（服务 hub = 三模式表；产品 hub = 分层图；方案 hub = 目标 → 方案 → 服务档位）
4. FAQ（3–5 条）→ contact-band

### T-Product 产品页（/products/*）
1. Hero：字母角标（如 `P · 01`）+ 名称 + 定位句 + [Get Started] [Docs↗]
2. 三卡：Software（这层有什么）· Services（对应的服务与档位）· Docs & Downloads
3. 六格价值（features，来自 data/portal/products.yaml）
4. 证据条：指标（brand.yml）/ 在线 demo / 截图或代码板（现有 code-plate 部件）
5. 相关方案 2–4 卡（Solutions）
6. 相关工具 / 子项目卡（projects.yaml：版本 · 协议 · 星数 · 安装命令 · **GitHub · Docs · Roadmap** 三链）
7. Community 块（GitHub · Discussions · Discord）→ FAQ → contact-band

### T-Service 服务页（/services/*）
1. Hero：服务名 + 谁适合 + 价格锚（公开价：如「$24K / year」「¥30,000 / 人天」）+ [Talk to the Author] [See pricing]
2. 「你得到什么」四格（deliverables）
3. 「怎么进行」流程（来信 → 诊断 → 报价 / 排期 → 执行 → 交付与回访）
4. 档位 / 计价表（从 pricing.yaml / services.yaml 渲染）
5. 边界与政策（响应时间、服务时间、渠道 → `/legal/support-policy/`）
6. 相关方案与产品
7. FAQ（pricing.yaml faq 可复用）→ contact-band（pricing=true）

### T-Productized 固定范围产品化服务（/services/health-check/ 等，Percona Health Audit 模板）
1. Hero：一句问题 + 「Starting from …」价格锚（数据来自 services.yaml，无价则不上此页）
2. **AT A GLANCE 盒**：价格 · 交付周期 · 交付物 · 形式（远程 / 现场）
3. 交付物清单（如：健康评分卡 · 按影响 / 成本排序的建议 · PDF 报告 · 一次答疑会）
4. **WHO IT'S FOR** 范围界定（如：≤ N 节点、单套部署）+ 超范围显式指向专家顾问 / 企业版
5. 流程三步：Scope → Execute → Hand Off
6. 相关：订阅档位（含季度 / 月度健康检查）· 可观测性产品页
7. FAQ → contact-band

### T-Solution 场景页（/solutions/*）
1. Hero：问题句（Percona「Database costs don't rise on their own …」式）+ [Talk] [Read the ledger / Get Started]
2. 问题陈述（一段 + 三个数字，数字必须有来源）+ 点名的「反派」（云账单 / 锁定 / 授权费）
3. 我们的做法：五条价值主张，**每条挂回一个产品或服务**
4. 证据：账本 / 计算器 / 公开案例（`/solutions/cloud-exit/` 已是完整实现，其余方案页复用其部件）
5. 落地路径（三到四步）+ 每一步接得住的服务档位
6. 相关产品 + 相关服务卡
7. 反对意见处理 / FAQ → contact-band

### T-Resource 资源页
- 列表页：卡片墙（类型标签 · 标题 · 日期 · 一句话），类型筛选（纯前端）+ 可见计数
- 条目页：新闻 / 案例 / 演讲用 OINK 标准单页模板（Markdown），门户 nav / footer 包裹

### T-Company 公司页
- `/about/`：现有三段叙事 + 新增「三个数字」带 + 奖项 / 赞助者 + 最新新闻三条
- `/contact/`、`/trust/`、`/legal/*`、`/brand/`：Markdown 正文 + 侧栏要点卡

---

## 6. 页面规格（page-by-page）

### 6.1 `/get-started/`（Percona「Downloads」）
- Hero：「One command. Your own PostgreSQL RDS.」/「一条命令，自建你的 RDS」+ 安装命令板（projects.yaml `install`；ZH 用 repo.pigsty.cc）
- 三条路：在线安装（curl）· 离线包（精确到 OS 小版本；商业档位说明）· 容器 / 云镜像（如有 → 否则不列）
- 系统要求摘要 + 支持矩阵入口（`/legal/lifecycle/`）；**不需要注册**
- 「下一步」：文档↗ · demo.pigsty.io↗ · PIG 装扩展 · 遇到问题 → `/services/consulting/`

### 6.2 `/products/` hub（T-Software）
- 分层清单：
  - **Distribution**：Pigsty（旗舰）
  - **Data layer**：PostgreSQL kernels（12）· Extensions（PGEXT 572 / 2,230）· PIG
  - **Management layer**：GLASS 可观测性（Victoria + Grafana + pg_exporter）· IaC（Ansible）· HA / PITR（Patroni / etcd / pgBackRest）
  - **Infrastructure layer**：repo.pigsty.io / .cc · 离线包 · Silo 对象存储 · SOW 仓库管理器
- 每项：Documentation + Install（+ Roadmap，pigsty.io/docs/about/roadmap）；版本 / 协议 / 星数来自 projects.yaml
- 「全部开源，Apache-2.0（Silo AGPL-3.0）」声明条；Community 块
- FAQ：「Pigsty 与订阅版有区别吗」「能只用某个组件吗」「支持哪些 OS / 架构」

### 6.3 `/products/pigsty/`
- 角标 `P · 01`；标题 Keeper「Pigsty — a free & better RDS alternative」/「Pigsty —— 免费且更好的 RDS 替代」
- 副题 Keeper「Our flagship: top-tier DBA judgment cast into open-source software, so enterprise-grade self-hosted PostgreSQL is no longer a privilege of the few.」
- 定位句「Everything you need to self-host PostgreSQL」/「自建企业级 PostgreSQL 所需的一切」；motto「Laptop to datacenter, one command」/「从笔记本到数据中心，一条命令」
- 六格价值：自愈 HA（Patroni/etcd）· PITR（pgBackRest）· 572 扩展 & 12 内核（MSSQL / Oracle / MySQL / Mongo 兼容）· Ansible IaC · 顶级监控 · Apache-2.0 不限节点
- 价值句 Keeper「Gives a junior engineer 70%+ of a professional DBA's capability」/「让初级工程师拥有专业 DBA 70% 以上的能力」
- 证据条：指标带（brand.yml）+ demo 链接 + `pigsty.yml` 代码板（现有）
- 相关：Services（订阅）· Solutions（下云 / 可靠性）· Tools

### 6.4 `/products/kernels-extensions/`
- 12 内核（列表以 pigsty.io 文档为准，数据化到 products.yaml）；PGEXT.CLOUD：2,230 收录 / 572 打包（brand.yml）；PIG（PG 14–18 × EL / Debian / Ubuntu × amd64 / arm64；Agent 友好结构化输出）
- 「We maintain the ground you build on」/「地基由我们打理，你只管构建」（Keeper）
- 相关方案：AI & Vector（P3）· 迁移（兼容内核）

### 6.5 `/products/observability/`
- 角标 `G · 03`；标题 Keeper「See everything your database does」/「把数据库的一切，画给你看」；「Observability is a first-class citizen」/「监控不是插件，是第一公民」；motto「See it before you tune it」/「先看见，再优化」
- 600+ 指标 / ~3,000 时间序列（brand.yml）· pg_exporter · 全景大盘 · demo.pigsty.io（常年在线，真实集群）
- 价值句 Keeper「Reading databases through dashboards is our native tongue」/「用图表解读数据库，是我们的母语」
- 相关服务：健康检查报告（订阅内含）· 单次健康巡检（P2）· 性能问题诊断（挂专家号）

### 6.6 `/products/infrastructure/`
- 角标 `I · 02`；标题 Keeper「Public infrastructure for the PostgreSQL ecosystem」/「撑起 PG 生态的公共基础设施」；motto「Air-gapped, compliant, sovereign — all covered」/「断网、合规、国产化，都有答案」
- 内容：全球仓库 + 大陆镜像 · 离线包 · PGEXT · Silo（MinIO 分支，持续安全更新 —— 14 个已记录 CVE 修复、恢复控制台、完整发行制品，AGPL-3.0，「Keep the interface. Own the objects.」）· SOW；`INFRA ENDPOINTS` 板（现有）
- gift-note 保留：「This layer is the missing i in the company's name → /about/#missing-i」
- 价值句 Keeper「Ecosystem continuity is itself infrastructure」/「生态的可持续，是一种基础设施」
- 相关方案：信创与合规（离线 / 国产架构）· 下云（对象存储替代）

### 6.7 `/products/tools/`
- 角标 `T · 05`；标题 Keeper「Sharp tools, all open source」/「顺手的兵器，全部开源」；副题保留「structured output, agent-friendly, comfortable for humans and AIs alike」
- 四卡固定顺序：Silo · PIG · pg_exporter · SOW（projects.yaml 完整字段；每卡 GitHub · Docs · Roadmap）
- **piglet**：piglet.run 现已上线（AI 开发沙箱：Claude Code + VS Code + Jupyter + PG18，有文档、GitHub、ZH 切换；但安装命令仍是主项目的 `repo.pigsty.io/get`）——是否解除「不露出」由 Q19 拍板；BOAR 未发现任何公开站点或仓库，继续不提；pgschema / dbrank 仓库存在但无官网，暂不上卡

### 6.8 `/services/` hub
- Hero Keeper「Expert help, when it matters」/「关键时刻，专家兜底」；副题 Keeper「Open source solves 90% of the problem; subscriptions and experts cover the last 10% — served by the people who wrote the code.」（Percona hub H1「We Don't Sell Databases. We Make Sure They Run.」同调）
- **三模式对照表**（Percona 脊柱的 PGSTY 版）：

  | | 订阅与支持 | 按需专家 | 产品化服务（P2） |
  |---|---|---|---|
  | 模式 | 响应式兜底 + 定期健康检查 | 项目制 / 按次 | 固定范围、固定交付、起步价 |
  | 计价 | 按年 · 按节点档位 | 按次 / 按天 / 面议 | Starting from … |
  | 入口 | /services/subscription/ · /price/ | /services/consulting/ · /services/emergency-migration/ | /services/health-check/ |
- 两组卡：持续订阅（四档 + 价格 + 一句差异）· 按需服务（挂专家号 $30 / 专家咨询 $400 / 紧急救援 $4,000/天 / 专家顾问 面议）
- 「WHEN TO CALL US」/「什么时候找我们」六条（现有）：严格 SLA · 疑难杂症 · 架构规划 · 下云与去 O · 信创国产化 · 自建 DBaaS
- 引 manifesto 一句「When you call, you reach the person who wrote the code.」；支持政策入口 → `/legal/support-policy/`

### 6.9 `/services/subscription/`
- 四档摘要卡（pricing.yaml tiers）+ 响应 / 渠道 / 时间矩阵（pricing.yaml matrix「技术支持」组）
- 「订阅买到的是什么」：商业许可 · 质保与缺陷修复 · 离线定制包 · 专家兜底 · SLA · 更宽版本覆盖（pricing.yaml faq 首条）
- 30 天企业评估试用（EN 也要写，现只在 ZH 注释）；EN「Commercial support is currently available in Asia」口径 → Q8
- 完整明细与购买 → `/price/`；政策 → `/legal/support-policy/`

### 6.10 `/services/consulting/`
- 挂专家号 / 专家咨询 / 专家顾问三段（services.yaml）；每段：适合谁 · 交付物 · 价格 · 怎么开始
- 流程：来信（主题 + 环境）→ 排期 → 会话 / 报告 → 回访；同调句候选「Hire us for the hard work; fire us when it's done.」（待用户定稿）
- 相关：可观测性（先看见再优化）· 迁移方案

### 6.11 `/services/emergency-migration/`
- 紧急救援（¥30,000 / 人天；$4,000 / day）：架构升级 · 数据迁移 · 故障响应 · 数据恢复；hero 可用「Nobody books a maintenance window expecting to use the rollback plan.」同调句
- 「怎么算一次救援」边界说明；与订阅档位「紧急故障处理」列的关系（Pro 付费 / Enterprise 含）
- 相关方案：下云（四步迁移路线）· 迁移（去 O）· 可靠性

### 6.12 `/services/health-check/`（P2，T-Productized）
- 单次健康巡检：AT A GLANCE（价格 · 周期 · 交付物 · 远程）· WHO IT'S FOR（节点上限）· 超范围 → 专家顾问 / 企业版
- 价格与周期必须先进 services.yaml（Q5）；无价则不建页

### 6.13 `/services/dbaas/`（P2）
- 「Running Pigsty as your own DBaaS / RDS offering」：面向云厂商 / ISV / 大企业平台组；Enterprise 档「RDS OEM」与再分发权限（pricing matrix「Redistribution rights」）
- 只写已有条款，不编 SLA、不编客户

### 6.14 `/solutions/` hub
- 保留现有导语 Keeper「Start from what you're trying to do」/「你要干什么，从这里进」；「The six letters say what we have; this page is organized by your goal」/「六字母讲的是我们有什么；这里按你的目标组织」
- 卡片：下云 · 主权与合规 · 可靠性 · 迁移 · DBaaS · AI（未建页前显示「在路上」文字，不做空页）

### 6.15 `/solutions/cloud-exit/`（✓ 保留）
- 现有结构不动（论点 → 判词 → 三大件谱系 → 计算器 → 行业价签 → 口径来源 → 公开案例 → 四步 → 三句反驳 → 文选 → contact-band 覆盖文案「Let's price out your exit」→ FAQ）
- 增：hero 加 [Talk to the Author]；页尾加「相关服务」（救援与迁移 · 订阅）与「相关产品」（Pigsty · Silo）
- 计算器另挂 `/resources/` 与导航「Cloud Cost Calculator」入口（同页锚点 `#calculator`）

### 6.16 `/solutions/sovereignty/`（P1，ZH≠EN）
- **EN**：Sovereign & air-gapped PostgreSQL —— 数据驻留、离线交付、零遥测无外呼、本地优先、云中立、Silo 自托管对象存储；loong64 进 PGDG 作为「我们推动上游支持新架构」的证据；tagline 变体不适用（EN 只有一种）
- **ZH**：信创与国产化 —— 龙芯 loong64（PGDG 官方仓库，2026-07）、ARM、国产操作系统与离线包（具体 OS 名单以 pigsty.cc 文档支持矩阵为准）；可用 `tagline_zh_xinchuang`「生产级自建，主权在你」；等保 / 商密等**不写任何未取得的认证**
- 相关服务：企业版（定制包）· 专家顾问；相关产品：Infrastructure

### 6.17 `/solutions/reliability/`（P2）· `/solutions/migration/`（P2）· `/solutions/dbaas/`（P2）· `/solutions/ai/`（P3）
- 同 T-Solution；`/solutions/migration/` 覆盖去 O、MySQL→PG、RDS→自建三条路，与 cloud-exit「四步」共用部件；`/solutions/ai/` 待 piglet / 向量方案就绪（Q19）

### 6.18 `/price/`（✓ 保留，升格为跨站权威页）
- 保留：四档 · 功能对比矩阵 · 按需服务 · FAQ · contact-band
- 增（P2）：「按节点数速算」小组件（输入节点数 → 推荐档位，纯前端读 pricing.yaml JSON）；与 `/services/*` 双向链接；页尾 FAQ 统一标题
- `pricing.yaml` 的 `detail_url` 现指向 pigsty.io/price —— 方向倒置；应改为 pgsty.com/price 为权威、产品站链回（Q15）

### 6.19 `/resources/` hub（P2）
- 卡片墙 + 类型筛选（可见计数）：News · Customer · Talk · Calculator · Compare · Essay↗（vonng.com/cloud）· Docs↗ · Blog↗
- 顶部固定三入口：文档 · 博客 · 下云计算器；`sites.yaml` 六站点作「站点矩阵」块

### 6.20 `/news/`（P2）
- 只发公司层面公告：发版（Pigsty / PIG / pg_exporter / Silo / SOW）、里程碑、奖项、价格 / 政策变更、活动；RSS
- 技术博客**不迁**（pigsty.io/blog、pigsty.cc/blog、vonng.com 保持）
- 首批可回填条目（已公开事实）：Pigsty v4.4.0（2026-07-10）· v4.3.0（2026-05-01）· v4.0 转 Apache-2.0（2026-02-03）· PIG v1.0（2026-01-30）· v3.7.0（2025-12）· loong64 进 PGDG（2026-07）· PostgreSQL Magneto Award（2025-11-29）· OSCHINA 2024 优秀贡献专家（2025-01-09）—— 日期以 pigsty.io/docs/about 与发布页为准
- 条目 = content/news/<slug>.md（EN/ZH 可不成对；缺翻译时列表页显示原语言并标注）

### 6.21 `/customers/`（P2）
- logo 墙 + **具名引言**（人 + 头衔 + 公司 + 具体结果，Percona 证言块模式，而非匿名走马灯），数据 data/portal/customers.yaml，**只渲染 `authorized: true`**
- pigsty.io/cc 首页已公开的 logo（Tantan / Bilibili / Airwallex / Momenta / Meitu / PolarDB / Bitdeer / OCI / Huafon / Linkfog / Motphys / Yingshi Jufeng —— 中文名以原站为准）与引言（「100+ PG clusters · 2.5M QPS · 1.5–2 DBAs · 5% public cloud TCO」）需逐条确认后置 true（Q2）
- 单篇案例页（P3）走 content/customers/<slug>.md，需书面授权

### 6.22 `/talks/`（P2）· `/compare/`（P2）· `/community/`（P2）
- talks：标题 · 会议 · 日期 · 视频 / 幻灯片（data/portal/talks.yaml）。已公开可回填：PGConf.Dev 2025 Montreal 闪电演讲 · PGEXT.DAY 主旨（2025-05-12）· PostgreSQL 数据库技术峰会（2025-04-19）· 第 13 届 PG China（2024-07-12）· PGCon.Dev 2024 unconference · PostgreSQL China 2023（2023-03-04）· GOTC 2024 —— 以 pigsty.io/docs/about/event 为准
- compare：每篇「Pigsty vs X」维度表 + 来源与抓取日期（沿用 cloudcost.yaml `refs` 规范）；不写主观贬损句
- community：GitHub org · Discussions · Discord · Telegram · 微信群（ZH 站二维码，现有 7 个群）· pg.center · PGEXT（下游用户 Omnigres / AutoBase 可提）· 贡献 / Issue 指南 · 行为准则链接（如有）

### 6.23 `/contact/`（P1）
- 分语言实体（EN：PGSTY PTE. LTD., Singapore；ZH：海口龙华辟技数据中心，统一社会信用代码 92460000MAG0XJ569B；ZH 是否列出 pigsty.cc 服务页上的另外两家主体见 Q17）
- 渠道：rh@vonng.com（主题模板按钮：Standard / Professional / Enterprise / Consulting / Emergency）· 微信 RuohangFeng（ZH 站二维码）· GitHub Discussions（社区问题）· Discord / Telegram
- 「期望响应」一句（订阅客户按支持政策；其余尽力）· 时区
- 表单 / 预约：Q6（静态站可用 Cloudflare Pages Functions / 第三方表单；默认 mailto）
- 结构化数据 Organization + ContactPoint

### 6.24 `/trust/`（P1）+ `/.well-known/security.txt`
- 零遥测声明（产品不外呼）· 软件包签名与校验（repo GPG / checksums；具体机制以 pigsty 文档为准）· 供应链（自建 RPM/DEB 仓库、SBOM 如有）· 漏洞披露（安全邮箱 Q10）· Silo 持续安全更新（14 个 CVE 修复记录）· 支持生命周期入口 · 隐私政策入口
- 不写未取得的认证；无 SOC2 / ISO 字样

### 6.25 `/legal/*`（P1–P2）
- `/legal/terms/`：订阅服务条款（节点计数 = Pigsty 纳管的独立 IP 数；按年计费；超节点加购；30 天评估；发票 / 合同；支付方式 EN 电汇 / PayPal / 卡、ZH 对公转账 + 支付宝 / 微信 —— 均来自 pricing.yaml faq）
- `/legal/privacy/`：站点仅生产环境加载 GA（G-JLB25NYKJX）；不设账号；产品零遥测；文档 CC BY 4.0（pigsty.io 许可页已覆盖 pgsty.com）
- `/legal/support-policy/`：渠道 / 响应 / 服务时间 / 专家工时 / 健康检查频率 / 紧急响应 —— 直接渲染 pricing.yaml matrix 相关分组，加严重级别定义（Q11）；**发布后 pigsty.cc/docs/about/service 与 pigsty.io/cc/price 以此页为准**（消解「30 分钟 vs <1h」「DBA 工时/月 vs 人天/年」矛盾）
- `/legal/lifecycle/`：各档位 PG 大版本 & OS 覆盖（pricing matrix「规模限制」组）+ 上游 PG EOL 对照
- `/legal/trademark/`：PIGSTY / PGSTY 名称使用规范；**不附加任何注册状态符号或声明**（make check 已断言）；他人商标声明

### 6.26 `/about/`（✓ 保留 + 增强）
- 保留：使命句 · 起源段（2018 工具箱 → 生态 → Silo 第二面旗帜 → 公司）· 少掉的 i 长版 + `name.yml` 板 · 时间轴（2018 工具箱 / 2020 开源 / 奇绩 S22 / 2026-07 loong64 进 PGDG / 双主体）· 「Deliberately small」manifesto · 主体与履历
- 增：「三个数字」带（github_stars · ext_packaged · kernels 或 since_year）；奖项（Magneto Award 2025 · OSCHINA 2024）与赞助者（MiraclePlus · Vercel OSS Program · JetBrains）一行（Q4）；最新新闻三条（P2）；Contact 出口
- 创始人履历全列（Pigsty 作者 2018 至今 · PostgreSQL 11 年、2015 起从业 · PG 中文文档译者 pg.center · DDIA 中文译者 · Alibaba / Tantan / Apple · 推动 PGDG loong64）

---

## 7. 首页详细规格（T-Home）

采用 Percona 的顺序（理念 → 服务 → 场景 → 软件），保留现有部件与所有锚点 id。软件免费的公司，先说「信什么、怎么服务」，再说「有什么」；hex 字母板已在 hero 承担了「有什么」的视觉索引。

| # | 段落 | id | 内容 | 来源 |
|---|---|---|---|---|
| 1 | Hero | `#hero` | tagline（brand.yml）作 H1；副题「The complete self-hosting solution for enterprise-grade PostgreSQL — HA, PITR, observability, and {ext_packaged} extensions, from laptop to datacenter in one command.」/「Apache-2.0. Unlimited nodes. Nothing held back.」；安装命令复制框；六边形字母板（不用 transform 居中）；字标 `.board-epigraph`（`.wm-i` 弱化，**不解释 i**）；CTA `Get Started` → /get-started/，`Talk to the Author` → /contact/ | 现有 |
| 2 | 三岔路口 | `#start` | 「Install it first」/「我想先装起来试试」→ /get-started/；「Evaluate for production」/「我在为公司做选型」→ /solutions/；「Start with the why」/「我想先弄清楚为什么」→ #yours（P1 起 → /solutions/sovereignty/ 或保留锚点，用户定） | 现有 |
| 3 | 原则带（Y） | `#yours` | 标题 Keeper「Your data. Your database. Yours.」/「数据主权，归你所有」；四格：完整功能开源 · 本地优先 · 云中立 · 回馈社区；motto Keeper「Freedom isn't a feature — it's a commitment」；价值句 Keeper「Run a good database — and run it well」；`values.yml` 板（现有）；出口 → vonng.com/cloud 与 /solutions/sovereignty/ | 现有 |
| 4 | 服务总览 | `#service` | 标题 Keeper「Expert help, when it matters」；副题 90% / 10% Keeper；四档价格卡（摘要）+ 四个按需服务小卡；CTA → /services/ 与 /price/ | pricing / services |
| 5 | 方案总览 | `#solutions` | 「Start from what you're trying to do」；四卡 下云 / 主权与合规 / 可靠性 / 迁移（未建页的显示「在路上」文字） | solutions.yaml |
| 6 | 产品总览 | `#postgres`（保留）| 标题 Keeper「Pigsty — a free & better RDS alternative」；四卡 Pigsty / Kernels & Extensions / Observability / Infrastructure & Silo（各一句 + Software / Docs 两链，Percona 技术带做法）；`#infras` `#glass`（含 `#graphics` 别名）`#toolbox` 作为卡片锚点保留 | products.yaml |
| 7 | 指标带 + 社会证明 | `#metrics` `#proof` | 「Built in public, measured in public」/「公开构建，有目共睹」四格（brand.yml）；下方 2–3 条**具名引言**，**只渲染 authorized:true**，无授权时只保留指标带 | brand / customers |
| 8 | 资源 | `#resources` | 最新新闻 / 演讲三条 + 下云计算器入口（P2 前只放计算器 + 文档 + 博客三入口） | news / talks |
| 9 | FAQ | `#faq` | 现有 buyer_faq（data/home/*.yaml，OINK dispatcher）；标题统一句 Q12 | 现有 |
| 10 | About teaser + contact band | `#about` `#contact` | 「Who we are」三行文案 + 「deliberately small」一句 + 创始人卡（现有）；contact-band「Let's talk PostgreSQL」保留 | 现有 |
| 11 | Footer | — | §4.5 | nav.yaml |

**备选顺序**（若用户更想产品先行）：1 hero → 2 doors → 3 metrics → 6 products → 4 services → 5 solutions → 3 principles → proof → resources → FAQ → about。两种顺序段落与 id 相同，只是排列不同，实现成本一致（Q21）。

减重目标：模板行数从 605 行降到 ≤ 400 行；每段 ≤ 4 卡；每卡 ≤ 2 行说明。

---

## 8. 内容与数据模型

| 文件 | 变更 | 说明 |
|---|---|---|
| `data/brand.yml` | 不变 + 可选 `faq_title` / `faq_title_zh` | 数字唯一来源；**跨站口径**：bin/metrics.py 定期回写星数；扩展数与 ext.pgsty.com `/list` 对齐（Q16） |
| `data/portal/nav.yaml` | **新增** | 六栏 + 下拉项 + 页脚五栏，双语，`external: true`；驱动 nav.html / footer.html；`hugo.yaml` `menu.main` 与之同步（供 llms.txt / 命令面板），验收比对 |
| `data/portal/products.yaml` | **新增**（由 projects.yaml + sites.yaml 提炼） | 每个产品页：key · letter · slug · title / titleZh · motto · features[6] · proof · related_services · related_solutions · docs / install / roadmap 链接；projects.yaml 继续作「工具卡」数据（版本 / 星数由 bin/metrics.py 回写） |
| `data/portal/services.yaml` | 扩展 | 现有四条加 slug · deliverables · process · faq · related；新增产品化服务条目（glance: price / turnaround / deliverables / scope）；`subscription` 引用 pricing.yaml |
| `data/portal/pricing.yaml` | `detail_url` 反向（Q15） | 支持政策 / 生命周期页直接渲染其 matrix；EN 也补 30 天试用与节点加购说明 |
| `data/portal/solutions.yaml` | **新增** | 每方案：slug · hero 问题句 · villain · stats（带 source）· pillars[5]（各挂 product/service）· path[3-4] · related · faq · phase |
| `data/portal/cloudcost.yaml` | 不变 | 计算器数据 |
| `data/portal/customers.yaml` | **新增** | name · logo · industry · person · title · quote · quoteZh · source_url · authorized（默认 false） |
| `data/portal/talks.yaml` | **新增** | title · event · date · video · slides · lang · kind（talk / award） |
| `data/portal/compare.yaml` | **新增** | 每篇：subject · rows[dimension, pigsty, other, note, ref, fetched_at] |
| `data/portal/sites.yaml` | 复用 | 落到 /resources/ 站点矩阵与 /community/ |
| `content/news/*.md` `content/customers/*.md` `content/legal/*.md` `content/trust.md` `content/contact.md` `content/brand.md` | **新增** | Markdown 正文 + 门户包裹布局；OINK 单页模板 |
| `content/{_index,price,about,solutions/*}.md` | 处理 | 现有正文人看不到（只进 .md / LLMS / 搜索）→ 要么由布局渲染 `.Content` 作导语，要么裁到 description |
| `data/home/<lang>.yaml` | 微调 | buyer_faq 保留；可追加 OINK 通用 section |
| `i18n/` | 视需要 | 部件级 UI 字符串（「了解更多」「文档」「安装」）集中，减少模板内 `{{ if $zh }}` |

数据规则（承接 v2 + 新增）：易变数字只在 brand.yml；成本数字只在 cloudcost.yaml；价格只在 pricing / services；
客户与证言只在 customers.yaml 且 `authorized: true`；对比与统计数字必须带 `ref` + `fetched_at`；
**商务口径（价格 / SLA / 主体 / 政策）以 pgsty.com 为权威，产品站摘要 + 链回**。

---

## 9. 双语与本地化规则

- 实体：EN 站只写 PGSTY PTE. LTD.（Singapore），ZH 站只写海口龙华辟技数据中心（其余两家主体是否出现见 Q17）；EN 站不出现 Haikou；`/contact/` `/legal/*` 页脚各按语言渲染。
- 术语（ZH）：自建（禁「自托管」）· 下云 · 可观测性；EN：self-hosted · cloud exit · observability。
- ZH≠EN 页面：`/solutions/sovereignty/`（信创）、`/solutions/migration/`（去 O 权重更高）、`/contact/`（微信 / 二维码）、`/legal/terms/`（发票 / 支付方式差异）、`/community/`（微信群）。
- tagline 变体：官网 / 合同用 `tagline_zh`；社区物料 `tagline_zh_community`；信创页 `tagline_zh_xinchuang`（brand.yml 已有三种）。
- 命令与链接按语言切换 repo.pigsty.io / repo.pigsty.cc、pigsty.io/docs / pigsty.cc/docs、vonng.com/en/cloud / vonng.com/cloud。
- 缺翻译的资源条目（news / talks）允许单语，列表页标注语言，不做空翻译页。
- ZH 站页脚 ICP 备案（`footer_icp`）有值则渲染。

---

## 10. 设计与技术约束

- 主题：OINK（go.mod 固定版本）；门户布局独立完整 HTML；`foot-scripts.html` 末尾必须调用 `palette.html`；主题切换 key `pgsty-landing-theme` 唯一。
- CSS：landing-v3（家族系统，token 与品牌六色不改）+ portal-v1（门户组件；新增 hub-cards / mode-table / glance-box / service-steps / proof-quotes / resource-grid / legal-prose 等类）；缓存指纹沿用 head-assets。
- 新页面 = 新布局文件（`layouts/products/single.html`、`layouts/services/single.html`、`layouts/solutions/single.html`、`layouts/resources/*.html`、`layouts/legal/single.html`）+ content 目录；共用段落抽 partial。
- 模板坑：`gt` 混用 int/float 退化为字符串比较，必须 `float` 转换；hero 蜂窝用负 margin 居中，不用 transform。
- SEO：`<title>` 模式 `<页名> — PGSTY`；hreflang 成对；OG 图；结构化数据 Organization（首页 / 关于 / 联系 + ContactPoint）、Product（/products/pigsty/）、Service + Offer（/services/subscription/ 用 pricing.yaml 价格）、FAQPage（含 FAQ 的页）、Article（news）。
- 性能：无外部字体 / 脚本依赖新增；图片 ≤ 200KB；Lighthouse 移动端 ≥ 90（性能 / 可访问性 / SEO）。
- 可访问性：跳到正文、地标、对比度、下拉键盘可达（现有实现延续）。
- 分析：GA 仅生产；CTA 点击（Get Started / Talk / Subscribe / Download / Calculator）打事件；产品零遥测主张不变。
- 部署：GitHub Pages + Cloudflare Pages（Hugo extended 0.164.0）；本地构建 ≠ Actions 绿 ≠ Cloudflare 部署 ≠ 公开域名可访问，四态分别验收；`make c` 全绿。

---

## 11. 转化与度量

- 主转化：`/contact/` 到达 · mailto 点击（分主题）· 微信二维码曝光（ZH）；次转化：`/get-started/` 命令复制、`/price/` 停留、计算器交互、Docs↗ 出站。
- 首页每段必须有一个明确出口（卡片 / 了解更多），杜绝「读完不知道点哪」。
- 目标（上线 90 天，参考值，非承诺）：/price/ 与 /services/ 合计 PV 占比 ≥ 25%；/contact/ 转化率（到达 → 点击 mailto / 表单）≥ 15%；平均访问深度 ≥ 2.5 页。

---

## 12. 素材复用清单

### 12.1 保留（原样或下沉）
- hero：tagline H1 · 副题 · 安装命令框 · 六边形字母板 · 字标 · 双 CTA；三岔路口；指标带；About teaser；contact-band（默认与 cloud-exit 覆盖文案）；buyer_faq
- 六字母板块全部文案与代码板 → 各 Products / Services 子页（§6.3–6.11），首页只留卡
- `/solutions/cloud-exit/` 全页 + `static/js/cloud-calc.js` + cloudcost.yaml
- `/price/` 全页 + pricing.yaml + services.yaml
- `/about/` 全页（使命 · 起源段 · 少掉的 i · 时间轴 · 刻意保持的小 · 主体与履历）
- projects.yaml（工具卡）· sites.yaml（→ Resources / Community）· brand.yml
- 部件：nav / footer / head-meta / head-assets / contact-band / foot-scripts / palette / alternate-formats / compact-number
- 附录 A 全部 Keeper lines

### 12.2 降级 / 合并
- 首页 P/I/G/S/T/Y 的完整清单 → 子页；首页只保留标题 + 一句 + 卡
- 导航中的首页锚点项 → 真实页面；`hugo.yaml` `menu.main` 改为由 nav.yaml 生成 / 同步
- 页脚「开源项目 / 站点 / 服务 / 社区」四栏 → 新五栏
- `content/*.md` 隐形正文 → 渲染为导语或裁掉

### 12.3 舍弃
- 无（`TODO(user)` 占位继续不渲染）

---

## 13. 分期计划

| 阶段 | 范围 | 页面（EN/ZH 各） | 验收 |
|---|---|---|---|
| **P1 骨架（约 2 周）** | nav.yaml 数据驱动 nav/footer（+ menu.main 同步）；`/get-started/`；`/products/` hub + 5 子页；`/services/` hub + 3 子页；`/solutions/sovereignty/`；`/contact/`；`/trust/` + security.txt；`/legal/` + terms / privacy / support-policy；首页减重与重排；cloud-exit / price / about 加交叉链接与统一页尾 | ≈ 20 | §14 全部；首页模板 ≤ 400 行；导航无锚点项 |
| **P2 资源与方案（约 3 周）** | `/resources/` `/news/`(+RSS) `/customers/`(授权后) `/talks/` `/compare/` `/community/`；`/services/health-check/`（有价后）`/services/dbaas/`；`/solutions/reliability/ migration/ dbaas/`；`/legal/lifecycle/ trademark/`；`/brand/`；价格页节点速算；首页 proof / resources 段 | ≈ +16 | 资源卡片墙筛选可用；customers 全部 authorized；compare 每行有 ref |
| **P3 补全（按需）** | `/solutions/ai/`（Q19 后）；`/customers/<slug>/`；`/partners/`；`/newsletter/`；资源分面升级 | ≈ +6 | 同上 |

每期结束：`make c` 全绿 → 双链部署 → 公开域名抽查（EN/ZH 各 3 页）→ 记录到 CLAUDE.md。

---

## 14. 验收标准（在 v2 红线上追加）

1. 数字单源：`grep -rn "5347\|5,347\|5510\|572\|2230\|2,230" content/ layouts/ i18n/ | grep -v data/` 为空。
2. 无 TODO 渲染：`grep -rn "TODO" public/` 为空。
3. Keeper lines：附录 A 每句在对应语言的渲染 HTML 中 grep 命中。
4. 术语：`grep -rn "自托管" content/ layouts/ data/ i18n/` 为空。
5. 实体拆分：EN 渲染产物不含「海口」「Haikou」；ZH 渲染产物不含「PTE. LTD.」（页脚版权行除外，若拍板保留）。
6. 链接：bin/check_internal_links.py 通过（含 hreflang、别名页不被站内链接、锚点存在）。
7. 导航：main 菜单无 `#` 锚点项；每个下拉项目标页存在且双语成对；`hugo.yaml` `menu.main` 顶层与 nav.yaml 一致。
8. 交叉链接：每个 /products/* 至少链 1 个 /services/* 与 1 个 /solutions/*；每个 /solutions/* 至少链 1 个产品、1 个服务与 /price/。
9. 客户：渲染产物中出现的客户名 ⊆ customers.yaml 中 `authorized: true` 的集合。
10. 品牌声明：`make c` 的注册商标断言通过；`/legal/trademark/` 不含 ® / ™ 声明。
11. 结构化数据：Organization / Service+Offer / FAQPage 通过 Rich Results 校验；`/.well-known/security.txt` 存在。
12. Lighthouse 移动端 ≥ 90 × 3；两条部署链均绿；公开域名 EN/ZH 抽查通过。
13. 跨站口径：`/price/` 与 `/legal/support-policy/` 上线后，pigsty.io/cc 的价格与服务页改为摘要 + 链回，或数字逐项一致（Q15 / Q16）。

---

## 15. 待拍板问题（用户决定）

| # | 问题 | 建议默认 |
|---|---|---|
| Q1 | 博客归属：pgsty.com 是否开 `/blog/`？ | **不开**；技术博客留 pigsty.io/cc，文选留 vonng.com；pgsty.com 只做 `/news/` 公告 + RSS |
| Q2 | 客户 logo / 引言授权：pigsty.io/cc 已公开的 12 个 logo 与 Tantan 引言，哪些可用于公司站？可否具名到人？ | 逐条确认后置 `authorized: true`；无授权则首页 proof 段整体不渲染 |
| Q3 | Careers 页：与「刻意保持的小」相悖，是否需要？ | **不做**；社区贡献入口放 `/community/` |
| Q4 | Partners / 赞助者：MiraclePlus、Vercel OSS、JetBrains 是否公开列出？其他合作伙伴名单？ | 赞助者先入 `/about/` 一行；`/partners/` P3 待名单 |
| Q5 | 服务目录：是否提供 Training / 托管运维？是否为「单次健康巡检 / 下云迁移评估 / HA 建设」定固定范围与起步价？ | 不做假页；产品化服务只在 services.yaml 有价格与周期后建页 |
| Q6 | 联系表单 / 预约：静态站用 mailto、还是 Cloudflare Pages Functions / 第三方表单 / 日程链接？ | P1 mailto + 主题模板；P2 评估表单 |
| Q7 | Newsletter：是否需要？用什么工具？（生态内目前无任何邮件订阅） | P3 |
| Q8 | EN 版支持区域口径：「Commercial support is currently available in Asia」是否保留 / 改写？EN 是否也写 30 天试用？ | 待定 |
| Q9 | 信创页事实：国产 OS 名单、龙芯支持范围、是否提及任何认证？ | 只写 pigsty.cc 文档已列事项；认证一律不写 |
| Q10 | 安全披露邮箱（security@…）与响应承诺 | 待定；无则 `/trust/` 与 security.txt 用 rh@vonng.com |
| Q11 | 支持政策的严重级别定义（S1–S4）措辞与响应目标；并裁定「Enterprise 30 分钟 vs <1h」「DBA 工时/月 vs 人天/年」哪个为准 | 以 pricing.yaml 现有值为准，不新增承诺；pigsty.cc 服务页随之修正 |
| Q12 | 首页 / 全站 FAQ 统一标题句 | EN「Straight answers, no sales script.」ZH「有问必答，不打官腔」 |
| Q13 | 主 CTA 文案：继续「Talk to the Author / 直接找作者聊」还是改「Contact us」？ | 保留（差异化） |
| Q14 | `/products/*` 深度：每个工具是否只在 pgsty.com 做卡片（出口到各自官网） | 是，只做卡片 + 一段 |
| Q15 | 价格权威页：pgsty.com/price 为准、pigsty.io/cc/price 改摘要 + 链回？还是两站各自维护？ | **pgsty.com 为准**；`pricing.yaml` `detail_url` 反向 |
| Q16 | 扩展数与星数跨站口径：572（brand.yml）vs 575（pigsty.io/cc）vs 576/2,241（ext.pgsty.com） | 定一个刷新节奏（bin/metrics.py 同时更新四站）或改为读 ext.pgsty.com 的数字 |
| Q17 | ZH 站主体：只写海口龙华辟技数据中心，还是像 pigsty.cc 服务页那样列出海南诸夏云数据有限公司 / 海口龙华越航科技中心？ | 待定；合同 / 发票主体应与 `/legal/terms/` 一致 |
| Q18 | 文档入口：「Docs↗」指 pigsty.io/docs 还是 doc.pgsty.com（后者已是完整镜像）？ | 待定；建议一个规范 URL，其余 301 |
| Q19 | piglet：piglet.run 已上线（有站、有文档、有 GitHub），是否解除 T 板块「不露出」？`/solutions/ai/` 是否随之提前？ | 待用户确认版本号与独立安装方式后再露出 |
| Q20 | 服务页同调句：是否采用「Hire us for the hard work; fire us when it's done.」/「Nobody books a maintenance window expecting to use the rollback plan.」这类语气？ | 用户定稿 |
| Q21 | 首页顺序：Percona 式「理念 → 服务 → 场景 → 产品」（§7 主案）还是产品先行（备选） | **主案** |
| Q22 | 产品栏目名：「Products / 产品」还是学 Percona 以客户技术命名「PostgreSQL」？ | 「Products」（避免与 postgresql.org 混淆） |

---

## 附录 A · Keeper lines（改版必须保留，验收逐条 grep）

**EN**
- Production Grade. Self-hosted. Truly Yours.
- PostgreSQL In Great STYle
- Apache-2.0. Unlimited nodes. Nothing held back.
- Install it first / Evaluate for production / Start with the why
- Built in public, measured in public
- Pigsty — a free & better RDS alternative
- Everything you need to self-host PostgreSQL / Laptop to datacenter, one command
- Gives a junior engineer 70%+ of a professional DBA's capability
- Public infrastructure for the PostgreSQL ecosystem / We maintain the ground you build on / Air-gapped, compliant, sovereign — all covered
- Ecosystem continuity is itself infrastructure
- See everything your database does / Observability is a first-class citizen / See it before you tune it
- Reading databases through dashboards is our native tongue
- Expert help, when it matters
- Open source solves 90% of the problem; subscriptions and experts cover the last 10% — served by the people who wrote the code.
- Sharp tools, all open source
- Your data. Your database. Yours. / What we stand for / Freedom isn't a feature — it's a commitment
- Run a good database — and run it well
- Our mission is to help the world make the most of PostgreSQL.
- The story of the missing i / The i is the letter we gave away — free for everyone, forever.
- Deliberately small / Small isn't our limitation. It's the service. / When you call, you reach the person who wrote the code.
- Start from what you're trying to do / The six letters say what we have; this page is organized by your goal
- Stop renting your database / Cloud exit isn't sentiment — it's arithmetic.
- Simple, transparent pricing / Expert services, pay as you go
- Let's talk PostgreSQL / Let's price out your exit

**ZH**
- 生产级自建，产权归你（合同 / 官网）· 生产级自建，谁也拿不走（社区）· 生产级自建，主权在你（信创）
- Apache-2.0，节点不限，没有藏着掖着的部分。
- 我想先装起来试试 / 我在为公司做选型 / 我想先弄清楚为什么
- 公开构建，有目共睹
- Pigsty —— 免费且更好的 RDS 替代 / 自建企业级 PostgreSQL 所需的一切 / 从笔记本到数据中心，一条命令
- 让初级工程师拥有专业 DBA 70% 以上的能力
- 撑起 PG 生态的公共基础设施 / 地基由我们打理，你只管构建 / 断网、合规、国产化，都有答案
- 生态的可持续，是一种基础设施
- 把数据库的一切，画给你看 / 监控不是插件，是第一公民 / 先看见，再优化
- 用图表解读数据库，是我们的母语
- 关键时刻，专家兜底 / 开源解决 90% 的问题，订阅与专家服务兜底最后 10% —— 服务直接来自写下这些代码的人。
- 顺手的兵器，全部开源
- 数据主权，归你所有 / 我们所相信的 / 自由不是功能，是承诺
- 选对数据库，也把它运行好 / 助您用好数据库，用好数据库
- 我们的使命，是帮助这个世界用好 PostgreSQL。
- 少掉的那个 i / 那个 i 是我们送出去的 —— 向所有人免费，永远免费。
- 刻意保持的小 / 「小」不是我们的短板，它就是服务本身。/ 接电话的就是写代码的那个人。
- 你要干什么，从这里进 / 六字母讲的是我们有什么；这里按你的目标组织
- 下云，把数据库拿回来
- 简单透明的价格 / 专家服务，按需采购
- 聊聊你的 PostgreSQL

## 附录 B · Percona 页面抓取清单（2026-08-18）

`/` · `/sitemap.xml` · `/page-sitemap.xml` · `/service-sitemap.xml` · `/technology-sitemap.xml` · `/resource-type-sitemap.xml` ·
`/postgresql/` · `/postgresql/software/` · `/postgresql/support/` · `/postgresql/calculator/` · `/monitoring/` · `/cloud-native/` ·
`/toolkit/` · `/downloads/` · `/services/` · `/services/expert-support/` · `/services/expertops/` ·
`/services/expert-consulting-and-services/` · `/services/database-health-audit/` · `/services/database-migrations/` ·
`/services/postgresql-high-availability/` · `/solution-bundles/` · `/mariadb-support/support-tiers/` · `/subscription-policies/` ·
`/use-cases/` · `/use-cases/cost-optimization/` · `/blog/` · `/resources/` · `/customer-stories/` · `/training/` · `/webinars/`（JS）·
`/about/` · `/partners/` · `/contact-us/`（JS）· `/community/`（→ percona.community）。
404：`/services/support`、`/use-cases/sovereignty-security-compliance`（真实路径 `/use-cases/sovereignty-security-and-compliance/`）。

Percona 静态页全集（page-sitemap）：法务 14 页；`/<db>/support/` ×5；calculators ×8；`/<db>/` hub ×5 + `/cloud-native/`；
`/<db>/software/` ×3 + `/downloads/`；`/use-cases/` ×5；`/webinars/ /toolkit/ /training/ /monitoring/`；
`/about/ /partners/ /careers/ /contact-us/ /security/ /services/ /solution-bundles/`；技术指南 8 页；`/services/*` 12 页。

## 附录 C · 旧 URL → 新 URL / 锚点映射

| 旧 | 新 | 方式 |
|---|---|---|
| `/#postgres` | `/products/pigsty/`（首页锚点保留为总览卡） | 锚点保留 + 卡片出口 |
| `/#infras` | `/products/infrastructure/` | 同上 |
| `/#glass` `/#graphics` | `/products/observability/` | 同上（`#graphics` 别名保留） |
| `/#service` | `/services/` | 同上 |
| `/#toolbox` | `/products/tools/` | 同上 |
| `/#yours` | 首页原则带（保留，移到第 3 段）+ `/solutions/sovereignty/` | 同上 |
| `/#contact` | `/contact/`（contact-band 保留） | 同上 |
| `/company/about/` | `/about/` | alias（已有） |
| `/solutions/` | 不变（改卡片 hub） | — |
| `/price/` | 不变（升格为跨站权威页） | — |
| 导航 Docs↗ | Resources ▾ → Docs↗（目标见 Q18） | — |
| 页脚「Service Terms」外链 pigsty.io/docs/about/service | `/legal/support-policy/` | 站内页取代外链 |

## 附录 D · 生态站点普查与跨站矛盾（2026-08-18）

**站点矩阵**：pigsty.io（EN 产品站：Docs / Extensions / Blog / Pricing；首页有 logo 墙 + Tantan 引言）· pigsty.cc（ZH 产品站：文档 / 扩展 / 模块 / 博客 / 服务；docs/about 下有 event / sponsor / license / community / roadmap 等 11 子页）· doc.pgsty.com（Pigsty 文档完整镜像）· ext.pgsty.com / pgext.cloud（扩展目录：576 打包 / 407 包 / 2,241 收录；下游 Omnigres、AutoBase）· silo.pgsty.com（14 个 CVE 修复、九次发布）· pig.pgsty.com · sow.pgsty.com · oink.pgsty.com · exp.pgsty.com · piglet.run（已上线）· demo.pigsty.io（v4.4.0 实例）· vonng.com/cloud（80+ 篇下云文章）· pg.center（对爬虫 403）· github.com/pgsty（30 仓库；除已知项目外还有 pgschema、dbrank、pgsql.cc）。

**已由产品站承担的「公司站功能」**：文档、下载、价格、博客、社区、许可、活动 / 奖项、赞助者、路线图、隐私、在线 demo。
**产品站不承担、公司站独占**：法律主体与司法辖区拆分、公司叙事与价值观、按买家问题组织的方案轴、下云经济学论证、长篇客户故事、Newsletter、Trust / 法务政策。

**跨站矛盾清单**（v3 上线前后需消解）：

| 事项 | 各站现值 | v3 处理 |
|---|---|---|
| 扩展数 | pgsty.com 572 · pigsty.io/cc 575 · ext.pgsty.com 576 / 2,241 | Q16 |
| 星数 | 5,510 · 5,465 · 5,521 | bin/metrics.py 统一回写节奏 |
| 企业版响应 | pigsty.cc/price「30 分钟 7×24」· pigsty.cc/docs/about/service「7×24 (<1h)」 | `/legal/support-policy/` 为准（Q11） |
| 档位与工时 | 价格页四档「5 / 10 DBA 小时 / 月」· 服务页三档「1 / 2 人天 / 年」 | 同上 |
| 价格页 | pgsty.com/price 与 pigsty.io/cc/price 全文重复，且 pgsty.com 的 `detail_url` 指向 pigsty.io | Q15 |
| ZH 主体 | pgsty.com 1 家 · pigsty.cc 服务页 3 家 | Q17 |
| 文档主机 | pigsty.io/docs · pigsty.cc/docs · doc.pgsty.com（+ 各产品自有 docs） | Q18 |
| piglet | pgsty.com 不露出 · pigsty.cc 文档导航已列 Piglet.Run · piglet.run 已上线 | Q19 |
