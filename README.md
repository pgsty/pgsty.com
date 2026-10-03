# PGSTY.com on OINK

[![Website](https://img.shields.io/badge/web-pgsty.com-0D9488?logo=cloudflare&logoColor=white)](https://pgsty.com)
[![GitHub Pages](https://github.com/pgsty/pgsty.com/actions/workflows/pages.yml/badge.svg)](https://github.com/pgsty/pgsty.com/actions/workflows/pages.yml)
[![Hugo](https://img.shields.io/badge/Hugo-extended%200.164.0-FF4088?logo=hugo)](https://gohugo.io/)

The bilingual PGSTY corporate portal pins
[`github.com/pgsty/oink`](https://github.com/pgsty/oink) `v1.1.0` as its Hugo
theme. The English and Chinese sites both present PGSTY PTE. LTD., Singapore.
The corporate pages cover the company, software projects, professional services,
pricing, solutions, contact, privacy, and service terms. OINK supplies navigation,
search, icons, favicons, and Markdown/LLMS output formats.

`data/company.yaml` is the canonical company identity, with registration details
verified against ACRA public data. The corporate design layer is
`static/css/corporate.css`; the existing component styles remain underneath it.
The homepage FAQ lives in `data/home/<language>.yaml`. Project descriptions and
individual licenses live in `data/portal/projects.yaml`. Public repositories,
manuals, knowledge resources, and the extension catalog live in
`data/portal/resources.yaml`, shared by the homepage and `/resources/`.

The homepage introduces the software we build, the public resources we maintain,
and our professional services, in that order. Its two-line hero is localized in
`layouts/index.html`; the matching Markdown and search content lives in
`content/_index.md` and `content/_index.zh.md`. Reusable project cards and resource
links are in `layouts/_partials/portal/`.

Read [AGENTS.md](AGENTS.md) for the current architecture, content sources, and
maintenance checks. The [corporate review notes](docs/CORPORATE-REVIEW.md) retain
official sources, the validation performed at the time, and outstanding business
details; they are not evidence of the current deployment state.

The homepage's public impact summary and bilingual `/impact/` pages share
[`data/impact/data.yaml`](data/impact/data.yaml). The dataset contains dated
GitHub/Docker Hub snapshots and complete available GA4/Cloudflare history.
Four full-width panels use ECharts bundled with OINK, fixed chart styles,
compact K/M/B summaries shared with the homepage, a repository list and a public data download.
Downloads and pulls combine Docker Hub and GitHub Release in the summary,
with Docker repositories stacked in one horizontal bar and GitHub Release
shown as one total. The Cloudflare headline and chart both count HTTP requests.
No analytics scripts are added.
See [the impact data notes](docs/IMPACT-DATA.md) for definitions and reproducible
import instructions. These are historical snapshots, not live counters.

Site navigation is OINK's own navbar: a centered menu tree with one-column
dropdown panels, an icon search trigger, and a phone drawer carrying the
full labelled tree. Entries come from `menu.main` in `hugo.yaml` — one tree per
language — and `layouts/_partials/portal/nav.html` only bridges them to the
theme's `navbar-item` / `navbar-entry-link` / `navbar-group-items` partials.
The portal carries no GitHub badge in its chrome. The language link shows the
target language's own short label; theme controls move into the drawer on narrow
screens. The chrome stylesheet is compiled from the
pinned module in `assets/scss/portal-oink.scss`; `static/css/portal-v1.css` maps
the Landing v3 palette onto the `--bs-*` / `--td-*` tokens it reads.

Every portal page also reuses OINK's same-origin, language-separated search
index and Command Palette. `Cmd/Ctrl-K` and `/` open page discovery and shared
page actions; `\` opens localized portal commands. The bridge lives in
`layouts/_partials/portal/palette.html`, while the registry, index, ranking,
dialog, and action behavior remain owned by the pinned theme. Colour state stays
in the portal's own `pgsty-landing-theme` key — the theme's `dark-mode.js` is
deliberately not loaded, so there is never a second store.

## Run

```sh
make d            # Debug with the sibling ../oink checkout
GOWORK=off make s  # Serve with the theme version pinned in go.mod
GOWORK=off make b  # Build with the pinned theme
GOWORK=off make c  # Run the complete site check with the pinned theme
```

`make d` applies a one-command replacement for the sibling OINK checkout without
pinning the preview port; set `PORT` to select an available one. The long targets
are `debug`, `serve`, `build`, and `check`. `make c` validates rendered
HTML, Markdown, and `llms.txt` links, and
rejects any false PGSTY/PIGSTY registered-trademark claim in source or output.
The ignored local `go.work` points to the sibling OINK checkout. Set
`GOWORK=off` when testing the pinned module. The build needs Hugo Extended, Go
(see `go.mod`), and Python 3 for the check scripts; there is no npm build step.
To update the pinned theme intentionally, run `make update-theme`, review
`go.mod` and `go.sum`, then rerun the checks.

## Deploy

The checked-in [GitHub Pages workflow](.github/workflows/pages.yml) builds and
deploys on pushes to `main` or manual dispatch. It installs Hugo Extended 0.164.0
and Go 1.26.6; `go.mod` currently declares Go 1.27.0. Check the actual toolchain
and workflow result when validating a release.

The recorded Cloudflare Pages setup also builds `main` and serves `pgsty.com`
using Hugo Extended 0.164.0. Those platform settings are not stored in this
repository and need live verification for deployment work. A local build,
commit, push, deployment, and public-site check are separate results.
