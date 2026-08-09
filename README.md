# PGSTY.com on OINK

[![Website](https://img.shields.io/badge/web-pgsty.com-0D9488?logo=cloudflare&logoColor=white)](https://pgsty.com)
[![GitHub Pages](https://github.com/pgsty/pgsty.com/actions/workflows/pages.yml/badge.svg)](https://github.com/pgsty/pgsty.com/actions/workflows/pages.yml)
[![Hugo](https://img.shields.io/badge/Hugo-extended%200.164.0-FF4088?logo=hugo)](https://gohugo.io/)

The bilingual PGSTY corporate portal imports
[`github.com/pgsty/oink`](https://github.com/pgsty/oink) as its Hugo theme.
Local overrides are limited to the bespoke home, about, pricing, and solutions
pages; OINK owns the standard navigation, search, content blocks, shortcodes,
and documentation/blog layouts.

## Run

```sh
make dev
make check
```

`make check` verifies the module graph, performs a strict production build, and
checks rendered internal links. To update the pinned theme intentionally, run
`make update-theme`, review `go.mod` and `go.sum`, then rerun the checks.

## Deploy

Pushing `main` triggers two independent builds:

- GitHub Actions builds and deploys the GitHub Pages site.
- Cloudflare Pages builds `main` with Hugo and serves `pgsty.com`.

Both deployment paths use Hugo extended 0.164.0.
