# PGSTY.com on OINK

[![Website](https://img.shields.io/badge/web-pgsty.com-0D9488?logo=cloudflare&logoColor=white)](https://pgsty.com)
[![GitHub Pages](https://github.com/pgsty/pgsty.com/actions/workflows/pages.yml/badge.svg)](https://github.com/pgsty/pgsty.com/actions/workflows/pages.yml)
[![Hugo](https://img.shields.io/badge/Hugo-extended%200.164.0-FF4088?logo=hugo)](https://gohugo.io/)

The bilingual PGSTY corporate portal pins
[`github.com/pgsty/oink`](https://github.com/pgsty/oink) `v0.2.0` as its Hugo
theme. The site keeps bespoke home, about, pricing, and solutions layouts while
OINK supplies the reusable content system, shortcodes, icon set, favicon
conventions, and Markdown/LLMS output formats. The bespoke homepage also
dispatches its extensible content band from `data/home/<language>.yaml` through
OINK's composable section API, so generic sections can evolve without copying
theme templates into this repository.

## Run

```sh
make d  # Debug with the sibling ../oink checkout
make s  # Serve with the theme version pinned in go.mod
make b  # Build with the pinned theme
make c  # Run the complete site check
```

`make d` creates an ignored `go.work` without pinning the preview port. The long
targets are `debug`, `serve`, `build`, and `check`; `dev` retains the pinned-theme
preview. `make c` validates rendered HTML, Markdown, and `llms.txt` links, and
rejects any false PGSTY/PIGSTY registered-trademark claim in source or output.
To update the pinned theme intentionally, run `make update-theme`, review
`go.mod` and `go.sum`, then rerun the checks.

## Deploy

Pushing `main` triggers two independent builds:

- GitHub Actions builds and deploys the GitHub Pages site.
- Cloudflare Pages builds `main` with Hugo and serves `pgsty.com`.

Both deployment paths use Hugo extended 0.164.0.
