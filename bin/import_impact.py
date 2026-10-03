#!/usr/bin/env python3
"""Rebuild the public Hugo YAML from checked-in aggregates and DD evidence.

Use collect_impact.py for an explicit refresh, then this offline importer.
"""
from __future__ import annotations
import argparse
import calendar
import csv
import hashlib
import json
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'data/impact/data.yaml'
EVIDENCE = ROOT / 'docs/impact-evidence'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def yaml_lines(value, indent=0):
    pad = ' ' * indent
    if isinstance(value, dict):
        for key, item in value.items():
            if isinstance(item, (dict, list)) and item:
                yield f'{pad}{key}:'
                yield from yaml_lines(item, indent + 2)
            else:
                yield f'{pad}{key}: {json.dumps(item, ensure_ascii=False)}'
    elif isinstance(value, list):
        for item in value:
            if isinstance(item, (dict, list)):
                yield f'{pad}-'
                yield from yaml_lines(item, indent + 2)
            else:
                yield f'{pad}- {json.dumps(item, ensure_ascii=False)}'


def months_between(start, end):
    y, m = map(int, start[:7].split('-'))
    result = []
    while f'{y:04}-{m:02}' <= end[:7]:
        result.append(f'{y:04}-{m:02}')
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)
    return result


def windows(days):
    result = []
    for day in sorted(set(days)):
        if result and date.fromisoformat(day) == date.fromisoformat(result[-1]['end']) + timedelta(days=1):
            result[-1]['end'] = day
        else:
            result.append({'start': day, 'end': day})
    return result


def bilingual(en, zh):
    return {'en': en, 'zh': zh}


def build(evidence=EVIDENCE):
    provenance = []

    def read(path, source, archive):
        raw = path.read_bytes()
        provenance.append({'source': source, 'archive': archive, 'sha256': hashlib.sha256(raw).hexdigest()})
        text = raw.decode('utf-8-sig')
        return json.loads(text) if path.suffix == '.json' else list(csv.DictReader(text.splitlines()))

    def public(name, source):
        return read(evidence / name, source, f'docs/impact-evidence/{name}')

    meta = public('metadata.json', 'collection')
    repos = public('github_repositories.csv', 'github')
    events = public('github_star_months.csv', 'github')
    docker = public('docker_repositories.csv', 'dockerhub')
    sites = public('ga_sites.csv', 'ga4')
    ga = public('ga_monthly.csv', 'ga4')
    cf = public('cloudflare_daily.csv', 'cloudflare')
    hosts = public('cloudflare_hosts_daily.csv', 'cloudflare')
    tencent_path = '资料包/09_原始附件/04_网站下载与社区/下载分类及汇总/tencent_monthly.csv'
    tencent = public('tencent_monthly.csv', 'tencent')
    provenance[-1]['original_archive'] = tencent_path

    def local_day(timestamp):
        return datetime.fromisoformat(timestamp.replace('Z', '+00:00')).astimezone(ZoneInfo('Asia/Shanghai')).date().isoformat()

    github_as_of = local_day(meta['github']['finished_at_utc'])
    docker_as_of = local_day(meta['dockerhub']['captured_at_utc'])
    require(len({r['name'] for r in repos}) == len(repos), 'Duplicate public repository')
    require(len(repos) == meta['github']['repositories'], 'Repository coverage mismatch')
    require(len({(r['repository'], r['month']) for r in events}) == len(events), 'Duplicate Star month')
    star_months = months_between(min(r['month'] for r in events), github_as_of)
    increments = {(r['repository'], r['month']): int(r['retained_stars']) for r in events}
    repositories = []
    for r in sorted(repos, key=lambda r: (-int(r['stars']), r['name'])):
        retained = 0
        values = []
        for month in star_months:
            retained += increments.get((r['name'], month), 0)
            values.append(retained)
        require(retained == int(r['stars']), f"Star series mismatch: {r['name']}")
        repositories.append({'name': r['name'], 'url': r['url'], 'stars': retained,
                             'forks': int(r['forks']), 'created_at': r['created_at'],
                             'fork': r['fork'].lower() == 'true', 'archived': r['archived'].lower() == 'true',
                             'values': values})
    stars = sum(r['stars'] for r in repositories)
    require(stars == meta['github']['retained_stars'], 'Star total mismatch')
    community_monthly = [{'month': m, 'total': sum(r['values'][i] for r in repositories),
                          'partial': m == github_as_of[:7]} for i, m in enumerate(star_months)]

    require(len({(r['site'], r['month']) for r in ga}) == len(ga), 'Duplicate GA domain/month')
    require(len({s['name'] for s in sites}) == len(sites), 'Duplicate canonical GA domain')
    ga_start = min(r['start'] for r in ga)
    ga_end = max(r['end'] for r in ga)
    ga_months = months_between(ga_start, ga_end)
    ga_lookup = {(r['site'], r['month']): int(r['views']) for r in ga}
    ga_sites = []
    for s in sites:
        values = [ga_lookup.get((s['name'], month)) for month in ga_months]
        ga_sites.append({'name': s['name'], 'url': f"https://{s['name']}/", 'start': s['start'] or None,
                         'end': s['end'] or None, 'recorded_days': int(s['recorded_days']),
                         'category': 'content' if s['name'].endswith('vonng.com') else 'pgsty',
                         'views': sum(v for v in values if v is not None), 'has_data': any(v is not None for v in values),
                         'values': values})
    ga_sites.sort(key=lambda s: (-s['views'], s['name']))
    ga_total = sum(s['views'] for s in ga_sites)
    require(ga_total == sum(int(r['views']) for r in ga), 'GA series total mismatch')
    audience_monthly = [{'month': m, 'views': sum(s['values'][i] or 0 for s in ga_sites),
                        'recorded_sites': sum(s['values'][i] is not None for s in ga_sites),
                        'partial': m in (ga_start[:7], ga_end[:7])} for i, m in enumerate(ga_months)]
    yearly = [{'year': y, 'views': sum(r['views'] for r in audience_monthly if r['month'].startswith(y)),
               'partial': y in (ga_start[:4], ga_end[:4])} for y in sorted({m[:4] for m in ga_months})]

    require(len({r['day'] for r in cf}) == len(cf), 'Duplicate Cloudflare account day')
    cf_months = months_between(cf[0]['day'], cf[-1]['day'])
    cf_monthly = []
    for m in cf_months:
        rows = [r for r in cf if r['day'].startswith(m)]
        total = sum(int(r['requests']) for r in rows)
        page_views = sum(int(r['page_views']) for r in rows)
        cached = sum(int(r['cached_requests']) for r in rows)
        require(0 <= cached <= total, 'Cloudflare cached requests exceed total')
        cf_monthly.append({'month': m, 'requests': total if rows else None,
                           'page_views': page_views if rows else None,
                           'cached_requests': cached if rows else None,
                           'uncached_requests': total - cached if rows else None,
                           'bytes': sum(int(r['bytes']) for r in rows) if rows else None,
                           'recorded_days': len(rows),
                           'partial': len(rows) != calendar.monthrange(int(m[:4]), int(m[5:]))[1] or any(r['partial'].lower() == 'true' for r in rows)})
    cf_requests = sum(int(r['requests']) for r in cf)
    cf_page_views = sum(int(r['page_views']) for r in cf)
    require(sum(r['requests'] or 0 for r in cf_monthly) == cf_requests, 'CF daily/monthly mismatch')
    require(sum(r['page_views'] or 0 for r in cf_monthly) == cf_page_views, 'CF PV daily/monthly mismatch')
    require(all(0 <= int(r['page_views']) <= int(r['requests']) for r in cf), 'CF PV exceeds requests')
    require(len({(r['day'], r['host']) for r in hosts}) == len(hosts), 'Duplicate normalized CF host/day')
    host_months = months_between(min(r['day'] for r in hosts), max(r['day'] for r in hosts))
    host_lookup = defaultdict(int)
    host_days = sorted({r['day'] for r in hosts})
    for r in hosts:
        require(r['host'].endswith('pigsty.io'), 'Unexpected host outside public pigsty.io zone')
        host_lookup[(r['host'], r['day'][:7])] += int(r['requests'])
    host_series = [{'name': host, 'requests': sum(int(r['requests']) for r in hosts if r['host'] == host),
                    'values': [host_lookup.get((host, month)) for month in host_months]}
                   for host in sorted({r['host'] for r in hosts})]
    host_series.sort(key=lambda s: (-s['requests'], s['name']))
    host_monthly = [{'month': month, 'requests': sum(s['values'][i] or 0 for s in host_series) if any(d.startswith(month) for d in host_days) else None,
                     'recorded_days': sum(d.startswith(month) for d in host_days), 'partial': True} for i, month in enumerate(host_months)]
    cf_repo = sum(r['requests'] for r in host_series if r['name'] == 'repo.pigsty.io')
    cn_requests = sum(int(r['requests']) for r in tencent)

    github_downloads = [{'name': f"pgsty/{r['name']}", 'url': r['url'] + '/releases',
                         'downloads': int(r['downloads']), 'non_auxiliary': int(r['non_auxiliary_downloads']),
                         'auxiliary': int(r['auxiliary_downloads']), 'releases': int(r['releases']), 'assets': int(r['assets'])}
                        for r in repos if int(r['assets']) > 0]
    github_downloads.sort(key=lambda r: (-r['downloads'], r['name']))
    downloads = sum(r['downloads'] for r in github_downloads)
    require(all(r['downloads'] == r['non_auxiliary'] + r['auxiliary'] for r in github_downloads), 'Release classification mismatch')
    docker_repos = [{'name': r['name'], 'url': r['url'], 'pulls': int(r['pulls'])} for r in docker]
    require(len({r['name'] for r in docker_repos}) == len(docker_repos), 'Duplicate Docker image')
    docker_repos.sort(key=lambda r: (-r['pulls'], r['name']))
    pulls = sum(r['pulls'] for r in docker_repos)
    measured_sites = sum(s['has_data'] for s in ga_sites)

    summary = [
        {'id': 'github_stars', 'value': stars, 'approximate': False, 'label': bilingual('GitHub Stars', 'GitHub Star'),
         'scope': bilingual(f'{len(repos)} public repositories', f'{len(repos)} 个公开仓库'),
         'period': bilingual(f'Snapshot · {github_as_of}', f'快照 · {github_as_of}'), 'anchor': 'community'},
        {'id': 'page_views', 'value': ga_total, 'approximate': False, 'label': bilingual('Ecosystem page views', '生态站点浏览'),
         'scope': bilingual(f'{measured_sites} sites · includes founder content', f'{measured_sites} 个站点 · 含创始人内容'),
         'period': bilingual(f'{ga_start}–{ga_end}', f'{ga_start}–{ga_end}'), 'anchor': 'audience'},
        {'id': 'cloudflare_requests', 'value': cf_requests, 'approximate': True, 'label': bilingual('Cloudflare requests', 'Cloudflare 请求'),
         'scope': bilingual('Account-wide · all recorded traffic', '账号范围 · 全部已记录流量'),
         'period': bilingual(f"{cf[0]['day']}–{cf[-1]['day']}", f"{cf[0]['day']}–{cf[-1]['day']}"), 'anchor': 'distribution'},
        {'id': 'downloads_and_pulls', 'value': downloads + pulls, 'approximate': False, 'label': bilingual('Downloads & pulls', '下载与拉取'),
         'scope': bilingual('Docker Hub + GitHub Release', 'Docker Hub + GitHub Release'),
         'period': bilingual(f'Cumulative · {github_as_of}', f'累计 · {github_as_of}'), 'anchor': 'downloads'},
    ]
    sources = {
        'github': {'name': 'GitHub', 'as_of': github_as_of, 'captured_at_utc': meta['github']['captured_at_utc'],
                   'finished_at_utc': meta['github']['finished_at_utc'], 'organization_created_at': meta['github']['organization_created_at'],
                   'collection_drift': meta['github']['collection_drift'], 'url': 'https://github.com/pgsty',
                   'note': bilingual('All current public repositories, including forks and archives. Cumulative history reconstructs Stars still retained at collection; removed Stars are unavailable. Repository history before PGSTY organization creation (2024-01-21) is included. This is current-portfolio history, not past organization membership or exact historical net stocks.',
                                     '涵盖当前全部公开仓库，含 Fork 与归档仓库。按采集时仍保留的 Star 时间重建累计历史，已取消的 Star 无法恢复。包含组织成立（2024-01-21）之前的项目历史；表示当前仓库组合的历史，不表示当时组织成员范围或历史净存量。')},
        'ga4': {'name': 'Google Analytics 4', 'start': ga_start, 'end': ga_end, 'configured_sites': len(sites), 'measured_sites': measured_sites,
                'extracted_at_utc': meta['analytics']['extracted_at_utc'], 'overlaps': meta['analytics']['ga']['overlaps'],
                'url': 'https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema',
                'note': bilingual('Hostname-filtered GA4 screenPageViews for all configured ecosystem domains, including founder content; not all sites belong to the company. Monthly PV sums daily PV. On overlapping migration days, retain the higher stream PV rather than summing both. Tracking start/end differs by site; missing months remain null. Repeat views and reported peaks are retained; PV is not unique people.',
                                  '全部已配置生态域名的 GA4 screenPageViews，含创始人内容站，并非均归公司所有。月度 PV 由每日 PV 汇总；迁移重叠日保留两个数据流中的较大 PV，不相加。各站采集起止不同，缺测月份为空。保留重复浏览与原始峰值，PV 不等于独立人数。')},
        'cloudflare': {'name': 'Cloudflare', 'start': cf[0]['day'], 'end': cf[-1]['day'], 'observed_days': len(cf),
                       'last_collected_at': meta['analytics']['cloudflare']['last_collected_at'], 'windows': windows(r['day'] for r in cf),
                       'host_windows': windows(host_days), 'host_observed_days': len(host_days), 'host_start': host_days[0], 'host_end': host_days[-1],
                       'url': 'https://developers.cloudflare.com/analytics/graphql-api/sampling/',
                       'chart_metric': 'requests', 'summary_metric': 'requests',
                       'note': bilingual('Full available account/day history. Both headline and chart count HTTP requests, including websites, software delivery, automation and errors. The separate page_views field is retained in the dataset but is not used for this chart. Host drilldown is a separate adaptive dataset over pigsty.io on recorded days only; never add these profiles together. Source dates describe actual recorded coverage. The last recorded day is partial; no extrapolation beyond the archive.',
                                         '完整可用账号/日历史。顶部数字和图表均统计 HTTP 请求，包含网站、软件分发、自动化与错误。独立的 page_views 字段保留在数据文件中，不用于此图。站点明细是 pigsty.io 独立自适应数据，仅覆盖已记录日，不能与账号总量相加。来源日期表示实际记录范围。末日不完整，不外推到归档之外。')},
        'dockerhub': {'name': 'Docker Hub', 'as_of': docker_as_of, 'captured_at_utc': meta['dockerhub']['captured_at_utc'], 'url': 'https://hub.docker.com/u/pgsty',
                      'note': bilingual('Cumulative counters of all public pgsty images, including historical pgsty/minio. Includes repeat and automated pulls; not unique users or installations. The headline combines Docker pulls and GitHub downloads arithmetically; the horizontal chart stacks Docker repositories within one channel and keeps GitHub Release as one total.',
                                        '全部 pgsty 公开镜像累计计数，含历史 pgsty/minio，包含重复与自动化拉取，不等于独立用户或安装实例。顶部下载与拉取为两个渠道计数的算术和，横向图将 Docker 仓库堆叠在同一渠道内，GitHub Release 保留一个总量。')},
        'tencent': {'name': 'Tencent CDN', 'start': '2026-01-27', 'end': '2026-08-26', 'url': 'https://pigsty.cc/docs/repo/',
                    'note': bilingual('Separate repo.pigsty.cc access-log archive, including metadata, repeats, automation and errors. January and August are partial; August 26 ends at 19:59. Not added to the Cloudflare account total.',
                                      '单列 repo.pigsty.cc 的访问日志，含元数据、重复、自动化与错误。1 月、8 月不完整，8 月 26 日截至 19:59。不加入 Cloudflare 账号总量。')},
    }
    prepared_on = local_day(max(meta['github']['finished_at_utc'], meta['dockerhub']['captured_at_utc'], meta['analytics']['extracted_at_utc']))
    return {'schema_version': 3, 'prepared_on': prepared_on, 'summary': summary, 'sources': sources,
            'community': {'stars': stars, 'public_repositories': len(repos), 'forks': sum(r['forks'] for r in repositories),
                          'releases': sum(int(r['releases']) for r in repos), 'months': star_months, 'monthly': community_monthly, 'repositories': repositories},
            'audience': {'views': ga_total, 'months': ga_months, 'monthly': audience_monthly, 'yearly': yearly, 'sites': ga_sites,
                         'chart_y_max': 180000},
            'distribution': {'cloudflare_requests': cf_requests, 'cloudflare_page_views': cf_page_views, 'cloudflare_bytes': sum(int(r['bytes']) for r in cf),
                             'monthly': cf_monthly, 'host_months': host_months, 'host_monthly': host_monthly, 'hosts': host_series, 'repository_requests': cf_repo,
                             'tencent_requests': cn_requests, 'package_successful_gets': sum(int(r['package_payload_successful_gets']) for r in tencent),
                             'tencent_monthly': [{'month': r['month'][:7], 'requests': int(r['requests']), 'partial': r['is_partial_month'].lower() == 'true'} for r in tencent]},
            'downloads': {'total': downloads + pulls, 'github_assets': downloads, 'github_non_auxiliary_assets': sum(r['non_auxiliary'] for r in github_downloads),
                          'github_auxiliary_assets': sum(r['auxiliary'] for r in github_downloads), 'github_repositories': github_downloads,
                          'docker_pulls': pulls, 'docker_repositories': docker_repos}, 'provenance': provenance}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--evidence', type=Path, default=EVIDENCE)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    data = build(args.evidence.expanduser())
    output = '# Public aggregates only. Source dates and coverage are retained.\n' + '\n'.join(yaml_lines(data)) + '\n'
    if args.check:
        require(OUTPUT.read_text() == output, 'Public YAML differs from evidence; rebuild and review')
        print('Public YAML reconciles and is reproducible.')
    else:
        OUTPUT.write_text(output, encoding='utf-8')
        print(f'Wrote {OUTPUT.relative_to(ROOT)} from {len(data["provenance"])} inputs.')
    for metric in data['summary']:
        print(f"{metric['id']}: {metric['value']:,}")
    print(f"docker_pulls: {data['downloads']['docker_pulls']:,}")


if __name__ == '__main__':
    main()
