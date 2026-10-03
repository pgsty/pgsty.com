#!/usr/bin/env python3
"""Collect public impact evidence without exporting identities or account IDs.

Read-only sources: public GitHub / Docker Hub APIs and the local analytics DB.
The checked-in aggregates let import_impact.py rebuild the YAML offline.
"""

from __future__ import annotations

import argparse
import csv
import json
import subprocess
import urllib.request
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = ROOT / "docs/impact-evidence"


def write_csv(path, rows, fields):
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def github(endpoint, stars=False):
    accept = "application/vnd.github.star+json" if stars else "application/vnd.github+json"
    result = subprocess.run(["gh", "api", "--paginate", "--slurp", "-H", f"Accept: {accept}",
                             endpoint], text=True, capture_output=True, check=True)
    pages = json.loads(result.stdout)
    return [item for page in pages for item in (page if isinstance(page, list) else [page])]


def auxiliary(name):
    name = name.lower()
    return any(token in name for token in ("checksum", "sha256", "sha512", "sbom", "provenance", "attestation")) or name.endswith((".txt", ".asc", ".sig", ".pem"))


def collect_github(out):
    started = datetime.now(timezone.utc).isoformat(timespec="seconds")
    organization = github("orgs/pgsty")[0]
    repositories = github("orgs/pgsty/repos?type=public&sort=full_name&per_page=100")

    def collect_repo(repo):
        name = repo["name"]
        monthly = Counter()
        if repo["stargazers_count"]:
            # Discard all stargazer identity fields; only monthly counts survive.
            for event in github(f"repos/pgsty/{name}/stargazers?per_page=100", stars=True):
                monthly[event["starred_at"][:7]] += 1
        releases = [r for r in github(f"repos/pgsty/{name}/releases?per_page=100") if not r["draft"]]
        total = non_aux = assets = 0
        for release in releases:
            for asset in release.get("assets", []):
                total += asset["download_count"]
                assets += 1
                if not auxiliary(asset["name"]):
                    non_aux += asset["download_count"]
        return {"name": name, "url": repo["html_url"], "created_at": repo["created_at"],
                "stars": sum(monthly.values()), "metadata_stars": repo["stargazers_count"],
                "forks": repo["forks_count"], "fork": repo["fork"], "archived": repo["archived"],
                "releases": len(releases), "assets": assets, "downloads": total,
                "non_auxiliary_downloads": non_aux, "auxiliary_downloads": total - non_aux}, monthly

    with ThreadPoolExecutor(max_workers=3) as pool:
        result = list(pool.map(collect_repo, sorted(repositories, key=lambda r: r["name"])))
    rows = [row for row, _ in result]
    events = [{"repository": row["name"], "month": month, "retained_stars": count}
              for row, monthly in result for month, count in sorted(monthly.items())]
    write_csv(out / "github_repositories.csv", rows, list(rows[0]))
    write_csv(out / "github_star_months.csv", events, ["repository", "month", "retained_stars"])
    print(f"GitHub: {len(rows)} public repositories, {sum(r['stars'] for r in rows):,} retained Stars", flush=True)
    return {"captured_at_utc": started, "finished_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "organization_created_at": organization["created_at"], "repositories": len(rows),
            "metadata_stars": sum(r["metadata_stars"] for r in rows),
            "retained_stars": sum(r["stars"] for r in rows),
            "collection_drift": sum(r["stars"] - r["metadata_stars"] for r in rows),
            "url": "https://github.com/pgsty"}


def collect_docker(out):
    started = datetime.now(timezone.utc).isoformat(timespec="seconds")
    url = "https://hub.docker.com/v2/repositories/pgsty/?page_size=100"
    rows = []
    while url:
        request = urllib.request.Request(url, headers={"User-Agent": "pgsty-impact/2.0"})
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.load(response)
        for repo in payload["results"]:
            if not repo["is_private"]:
                rows.append({"name": f"pgsty/{repo['name']}", "pulls": repo["pull_count"],
                             "url": f"https://hub.docker.com/r/pgsty/{repo['name']}"})
        url = payload.get("next")
    rows.sort(key=lambda r: (-r["pulls"], r["name"]))
    write_csv(out / "docker_repositories.csv", rows, ["name", "pulls", "url"])
    print(f"Docker Hub: {len(rows)} public images, {sum(r['pulls'] for r in rows):,} pulls", flush=True)
    return {"captured_at_utc": started, "url": "https://hub.docker.com/u/pgsty"}


def query(sql, database):
    result = subprocess.run(["psql", database, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-c",
                             "BEGIN READ ONLY; SET LOCAL statement_timeout = '30s'; " +
                             f"SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM ({sql}) t; COMMIT;"],
                            text=True, capture_output=True, check=True)
    return json.loads(next(line for line in result.stdout.splitlines() if line.startswith("[")))


def collect_analytics(out, database):
    registry = query("""
        SELECT s.hostname AS name, min(d.day)::text AS start, max(d.day)::text AS end,
               count(DISTINCT d.day)::int AS recorded_days,
               count(DISTINCT s.site_id)::int AS streams,
               max(d.updated_at)::text AS last_synced
          FROM ga.site s LEFT JOIN ga.metric_day d USING (site_id)
         WHERE s.enabled AND s.hostname IS NOT NULL
         GROUP BY s.hostname ORDER BY s.hostname
    """, database)
    monthly = query("""
        WITH ranked AS (
          SELECT s.hostname, d.day, d.pv,
                 row_number() OVER (PARTITION BY s.hostname,d.day ORDER BY d.pv DESC,s.site_id DESC) AS choice
            FROM ga.metric_day d JOIN ga.site s USING(site_id)
           WHERE s.enabled AND s.hostname IS NOT NULL
        )
        SELECT hostname AS site, to_char(day,'YYYY-MM') AS month,
               sum(pv)::bigint AS views, count(*)::int AS recorded_days,
               min(day)::text AS start, max(day)::text AS end
          FROM ranked WHERE choice=1 GROUP BY hostname,to_char(day,'YYYY-MM') ORDER BY 1,2
    """, database)
    overlaps = query("""
        SELECT s.hostname AS site,d.day::text AS day,count(*)::int AS streams,
               (sum(d.pv)-max(d.pv))::bigint AS excluded_views
          FROM ga.metric_day d JOIN ga.site s USING(site_id)
         WHERE s.enabled AND s.hostname IS NOT NULL
         GROUP BY s.hostname,d.day HAVING count(*)>1 ORDER BY 1,2
    """, database)
    core = query("""
        SELECT to_char(bucket_start AT TIME ZONE 'UTC','YYYY-MM-DD') AS day,
               (metrics->>'requests')::bigint AS requests,
               (metrics->>'page_views')::bigint AS page_views,
               (metrics->>'cached_requests')::bigint AS cached_requests,
               (metrics->>'bytes')::bigint AS bytes,
               (metrics->>'is_partial_day')::boolean AS partial,
               (metrics->>'avg_sample_interval')::numeric AS sample_interval
          FROM cdnlog.cf_metrics
         WHERE profile_id='pigsty_account_day_core' AND dataset='httpRequests1dGroups'
           AND scope_type='account' AND bucket_width=interval '1 day' AND dimensions='{}'::jsonb
         ORDER BY bucket_start
    """, database)
    hosts = query("""
        SELECT to_char(bucket_start AT TIME ZONE 'UTC','YYYY-MM-DD') AS day,
               rtrim(regexp_replace(lower(dimensions->>'clientRequestHTTPHost'), ':[0-9]+$', ''), '.') AS host,
               sum((metrics->>'count')::bigint)::bigint AS requests
          FROM cdnlog.cf_metrics
         WHERE profile_id='pigsty_http_day_host' AND dataset='httpRequestsAdaptiveGroups'
           AND bucket_width=interval '1 day'
         GROUP BY 1,2 ORDER BY 1,2
    """, database)
    for name, rows, fields in [
        ("ga_sites.csv", registry, ["name", "start", "end", "recorded_days", "streams", "last_synced"]),
        ("ga_monthly.csv", monthly, ["site", "month", "views", "recorded_days", "start", "end"]),
        ("cloudflare_daily.csv", core, ["day", "requests", "page_views", "cached_requests", "bytes", "partial", "sample_interval"]),
        ("cloudflare_hosts_daily.csv", hosts, ["day", "host", "requests"]),
    ]:
        write_csv(out / name, rows, fields)
    print(f"GA: {len(registry)} domains, {len(monthly)} site-month rows; CF: {len(core)} account days", flush=True)
    return {"extracted_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "ga": {"tables": ["ga.site", "ga.metric_day"], "overlap_rule": "maximum PV per hostname and day; never sum overlapping streams",
                   "overlaps": overlaps, "metric": "screenPageViews", "monthly_aggregation": "sum of hostname-filtered daily page views"},
            "cloudflare": {"table": "cdnlog.cf_metrics", "core_profile": "pigsty_account_day_core",
                           "host_profile": "pigsty_http_day_host", "bucket_timezone": "UTC",
                           "chart_metric": "requests", "summary_metric": "requests",
                           "last_collected_at": query("SELECT max(collected_at)::text AS at FROM cdnlog.cf_metrics WHERE profile_id='pigsty_account_day_core'", database)[0]["at"]}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--database", default="host=/tmp port=5432 dbname=data user=postgres")
    parser.add_argument("--only", choices=["github", "dockerhub", "analytics", "all"], default="all")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    meta_path = args.output / "metadata.json"
    metadata = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    if args.only in ("all", "analytics"):
        metadata["analytics"] = collect_analytics(args.output, args.database)
        meta_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")
    if args.only in ("all", "github"):
        metadata["github"] = collect_github(args.output)
        meta_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")
    if args.only in ("all", "dockerhub"):
        metadata["dockerhub"] = collect_docker(args.output)
        meta_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
