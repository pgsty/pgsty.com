# Public impact data and chart design

`data/impact/data.yaml` (schema 3) drives the homepage summary, both `/impact/`
pages, their Markdown/LLMS content, and the downloadable `/impact/data.yaml`.
The YAML contains public aggregates, source dates, coverage, and input hashes.

## Sources and verified totals — 2026-10-03 revision

| Metric | Recorded total | Coverage |
| --- | ---: | --- |
| GitHub Stars | 11,150 | All 62 current public repositories; fresh 2026-10-03 collection |
| GA4 page views | 2,125,686 | 20 measured domains among 22 configured domains; 2022-05-20–2026-10-01 |
| Cloudflare account requests | approximately 555,249,865 | All 478 archived UTC days; 2025-05-07–2026-08-27 |
| Cloudflare account page views | approximately 507,268,313 | Separate `page_views` field from the same 478 daily records |
| Cloudflare software repository requests | approximately 1,026,683 | `repo.pigsty.io` host detail; 47 discontinuous days |
| Tencent CDN repository requests | 2,785,634 | Separate `repo.pigsty.cc` archive; 2026-01-27–2026-08-26 |
| GitHub Release downloads | 212,858 | 13 repositories with uploaded assets; fresh 2026-10-03 collection |
| Non-auxiliary / auxiliary Release downloads | 103,259 / 109,599 | Filename classification; checksums/signatures etc. remain separate |
| Docker Hub pulls | 2,264,115 | All 5 public `pgsty` images; fresh 2026-10-03 collection |
| Downloads and pulls | 2,476,973 | Arithmetic sum of Docker Hub pulls and GitHub uploaded Release-asset downloads |

These are different measures and time windows, not unique people, installations,
customers. The combined downloads-and-pulls headline is a broad acquisition
counter, not a deduplicated adoption total. The new broad Cloudflare number
is **account traffic**, not exclusively software repository requests.

### Public evidence

`docs/impact-evidence/` holds eight share-safe files collected by
`bin/collect_impact.py`: repository counters, monthly retained Stars, Docker
counters, canonical GA domains/monthly PV, Cloudflare daily account counters,
Cloudflare host/day counters, and collection metadata. Only public aggregates
are retained. GitHub stargazer identities are discarded before writing; no GA
Account/Property IDs, Cloudflare account/zone IDs, credentials, IPs, raw request
paths, customer details, or financial materials are exported.

GA and Cloudflare were read from the local `data` database, populated by the
ZYDD analytics workflows. Read-only extraction queries use `ga.site`,
`ga.metric_day`, and `cdnlog.cf_metrics`. The ninth file, `tencent_monthly.csv`, is an exact public aggregate copy of
`../zydd/资料包/09_原始附件/04_网站下载与社区/下载分类及汇总/tencent_monthly.csv`.
The offline rebuild does not require access to the private DD directory.
The YAML records all nine input paths and SHA-256 hashes. Collection timestamps
are separate from each dataset's last observation.

### Measurement boundaries

- **Stars:** 106 monthly observations, 2018-01–2026-10, for every current public
  repository, including zero-Star, forked, and archived repositories. Each series
  cumulatively sums Stars still retained during collection; it excludes removed
  Stars and does not reconstruct exact historical net stocks. Organization
  creation is 2024-01-21, marked in the chart; earlier project history belongs to
  the current portfolio and does not imply the organization existed in 2018.
  Repository-list counters and retained-event totals both equal 11,150 in this
  collection (no observed collection drift).
- **GA:** `screenPageViews` filtered by configured hostname, summed from daily
  values into 54 calendar months. This replaces the earlier narrow, mostly
  whole-Property report with consistent per-domain data; the two reports should
  not be mixed. All ecosystem sites include translations and founder content,
  and do not imply company ownership. Two configured domains have no records;
  their series remain null. Domain migrations are combined across disjoint dates.
  On `pgsql.cc`, 2026-09-09 has two streams with 112 and 27 PV: retain 112,
  conservatively omit the smaller stream. This is not event-level deduplication;
  the archive cannot determine whether the two streams overlap at event level.
  Do not sum daily active users into monthly users or cross-site unique people.
  Preserve reported peaks. Each domain keeps its actual start and last record.
  The portal axis is fixed at 180,000 PV so the May 2026 peak does not compress
  the remaining months. Its true total is 353,708, including 282,813 from
  `pigsty.cc`. A triangle marks the clipped peak, and the tooltip retains the
  complete value; the YAML and headline are never capped.
- **Cloudflare account:** use only the single `pigsty_account_day_core` profile
  (`httpRequests1dGroups`, account/day, no dimensions), with UTC dates. Requests
  and `page_views` remain separate metrics. Both the headline and monthly chart
  use HTTP requests, totaling 555,249,865. The separate 507,268,313 Cloudflare
  `page_views` counter is retained in the evidence and YAML only. Cache
  fields remain in the evidence but are not displayed on the portal.
  No summing of account, overview, host, path, or minute profiles. Account traffic
  includes sites, software delivery, automation, bots and errors. May 2025 starts
  on the 7th; August 2026 ends on a partial 27th. No September/October values are
  invented; current public source coverage stops at the archive cutoff.
  This revision re-extracted all daily rows, reconciled them against CDNSTAT
  `cloudflare_metrics.csv`, and checked the latest bucket of every configured
  profile. All account/zone profiles still stop on August 27. No Cloudflare
  token was configured in the existing supported locations, so an upstream
  refresh was unavailable; extraction on October 3 is not newer source coverage.
  The referenced [daily sync task](codex://threads/01a0ece5-6a0f-7742-aa02-3830ff4ee797)
  and `../cdnstat/logs/daily-sync/20261002T123221.410690Z/summary.json` still
  report `blocked_missing_credentials`, zero Cloudflare API calls and the same
  cutoff. Tencent CDN and GA have newer records, but those are different sources.
  July has all 31 days (100,754,809 requests); August has 27 recorded days
  (30,076,149 requests), with August 27 partial. August 28 onward, September
  and October cannot be filled from the currently available Cloudflare archives.
- **Cloudflare hosts:** the independent `pigsty_http_day_host` adaptive profile
  covers only `pigsty.io` and 47 dates: April 29–May 20, August 1–13 and 16–27.
  Normalize hostname case, ports and terminal dots before aggregation. Keep all
  30 recorded hostnames. June and July remain null. These estimates are not
  added to the account totals or multiplied by sample intervals again.
- **Tencent:** preserve all eight archived months. First and last months are
  partial, ending August 26 at 19:59. Successful package GETs (1,221,454) may
  include repeated or partial transfers. This is an independent repository view.
- **Release files:** cumulative uploaded-asset counters per repository. Exclude
  draft releases and automatic source archives. Auxiliary files follow the DD
  classifier: filenames containing checksum/sha256/sha512/sbom/provenance/
  attestation, or ending `.txt`, `.asc`, `.sig`, `.pem`.
- **Docker:** retain all public images, including historical `pgsty/minio`.
  Repeated and automated pulls are included; no annual history is fabricated.
  Docker pulls and GitHub file downloads remain separate channels.

## Design and interaction

The portal is a compact public overview. Four panels each occupy the full
content width, using the existing corporate fonts, blue/teal palette, borders
and theme state. The pinned OINK 1.1.0 module supplies
`third_party/echarts/echarts.min.js`; the controller is
`assets/js/impact-charts.js`. No remote chart CDN, visitor API call, analytics
script, additional theme store or scheduled task is added.

The shared homepage/page summary displays **11K, 2.1M, 555M, 2.5M** in both
languages. `impact-number.html` chooses K/M/B, showing one decimal below ten
units and whole units otherwise. A lighter number weight, smaller suffixes and
labels below the numbers form one shared strip, without individual cell borders.
Full numerical values remain in the accessible
label, hover title and public YAML. Scope and date paragraphs are removed from
the four headline cells; the chart headings retain short source/date metadata.

| Panel | Fixed presentation | Remaining interface |
| --- | --- | --- |
| Open-source attention | Lightly smoothed stacked area, all 62 repositories, full 2018 history | Scrolling legend, time slider, Reset/download icons, expandable repository registry |
| Open knowledge | Monthly stacked bars for all ecosystem domains, 180K display ceiling | Legend pages, time slider, Reset/download icons; no site or style selector |
| Public infrastructure | Single monthly Cloudflare HTTP request series, full available account history | Time slider, Reset/download icons; no cache partition or scope selector |
| Downloads and pulls | Two horizontal bars: Docker Hub stacked by its five public repositories; GitHub Release as one total | Docker legend pages, exact repository values in tooltip, image download icon |

The former chart modes, range dropdown, series checkbox filters, monthly tables,
asset tables, repeated instructions and scope/source footer are removed. Complete
public evidence and definitions remain in the downloadable YAML and this
maintenance document. Markdown/LLMS summaries use the same compact numbers,
repository registry and two-channel counters.

Exact tooltips are available on interaction. Ctrl-wheel and slider zoom remain
on time charts; ordinary wheel scrolling stays available. Stars are reconstructed
from retained timestamps, and a quiet marker locates organization creation in
2024. Missing values stay null. Icon controls have accessible names, focus
indicators and 44-pixel mobile targets. Reduced motion is respected.

## Reproduce and refresh

```sh
# Offline: reconcile all checked-in public evidence.
python3 bin/import_impact.py
python3 bin/import_impact.py --check

# Explicit read-only refresh of public APIs and local analytics aggregates.
python3 bin/collect_impact.py
# Optional: --only github / dockerhub / analytics
python3 bin/import_impact.py

GOWORK=off make c
git diff --check
```

The scripts use Python's standard library, GitHub CLI and `psql`. DB queries are
read-only and bounded by a statement timeout. Offline reconciliation checks
unique series keys, every repository's event/counter agreement, GA series totals,
Cloudflare request/PV day-month sums and cache partitions, and Release
classifications. The combined headline is calculated from the same two channel
totals that drive the download bars.
Review evidence changes and coverage labels before committing any refresh.

Local builds and browser checks are distinct from committing, pushing,
deployment, and public-site verification. This revision was not published.
