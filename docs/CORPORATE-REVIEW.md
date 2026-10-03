# PGSTY corporate website — 2026-09-30

## Implemented

The English and Chinese website now consistently presents **PGSTY PTE. LTD.**,
Singapore. The redesign uses a restrained light/blue corporate layout, a
responsive navigation drawer, and the existing OINK search and theme tools.
Documentation authoring actions are excluded from the public search menu.

The site contains home, projects, services, pricing, solutions, cloud migration,
company, contact, privacy, and terms pages in both languages. Visitors can trace
real software to its documentation and source repository, review service scope
and reference prices, and follow an enquiry → proposal → agreement/invoice →
delivery and acceptance process. There is no simulated checkout or contact form.

Company identity is sourced from `data/company.yaml`. Project history no longer
implies that the company was incorporated in 2018. The pricing page identifies
USD/CNY explicitly; response targets apply under the relevant service agreement.
The cloud calculator retains its controls and data while identifying its
historical inputs and incomplete cost coverage. Public industry reports are
explicitly distinguished from PGSTY customer cases.

The site no longer injects Google Analytics. Its privacy notice describes
hosting request information, business correspondence, theme storage and local
search. Hosting-provider behavior must still be checked on the deployed site.

## Official company identity

The ACRA dataset checked on 2026-09-30 (dataset updated 2026-09-16) reports:

| Field | Value |
| --- | --- |
| Legal name | PGSTY PTE. LTD. |
| UEN | 202617609H |
| Incorporation | 2026-04-21 |
| Entity | Private Company Limited by Shares |
| Status | Live Company |
| Registered office | 72 Bendemeer Road, #02-05, Luzerne, Singapore 339941 |

Sources: [ACRA public dataset](https://data.gov.sg/datasets/d_181005ca270b45408b4cdfc954980ca2/view),
[record query](https://data.gov.sg/api/action/datastore_search?resource_id=d_181005ca270b45408b4cdfc954980ca2&filters=%7B%22uen%22%3A%22202617609H%22%7D).
The website labels this as the registered office, not a working office or visitor
location. A current ACRA Business Profile remains the formal application record.

## Account-review requirements and remaining inputs

[Apple Developer organisation enrollment](https://developer.apple.com/help/account/membership/program-enrollment)
requires a legal entity, D-U-N-S number, binding authority, a work email associated
with the organisation's domain, and a publicly available functional website with
substantive content. This redesign addresses the website presentation; it does
not establish the other enrollment conditions.

[Airwallex Singapore verification](https://help.airwallex.com/hc/en-gb/articles/900001756886-Verifying-your-business-in-Singapore)
requires business and relevant personal/ownership/authorisation information.
Its [payment-method onboarding website requirements](https://www.airwallex.com/docs/connected-accounts/onboarding/kyb-and-onboarding/payment-method-onboarding-requirement)
are a separate scope: legal identity and contact information, matching business
activity, service/product and price information, policies and, where applicable,
a supported payment checkout. Do not treat payment-method rules as identical to
ordinary business-account verification.

Still obtain or confirm before submitting an application:

- An actually working company-domain email address. The site retains the real
  existing contact `rh@vonng.com`; it does not invent `hello@pgsty.com`.
- A business phone number that the company authorises for public display,
  particularly if payment-method onboarding requires it.
- D-U-N-S record and applicant signing authority for Apple.
- Current ACRA Business Profile and applicable KYC/ownership/authority records.
- The actual contract terms for payments, renewal, delivery, cancellation and
  refunds. Website terms describe the procurement process and require those
  conditions to be defined before payment; they do not fabricate a fixed policy.
- Final public HTTPS pages, domain association, functioning mailbox, and any
  hosting-injected scripts after deployment.

No customer references, staff counts, certifications, offices, platform
endorsements, payment integrations or review results were fabricated. A website
cannot guarantee approval by Apple or Airwallex.

## Validation

- Pinned OINK v1.1.0 with `GOWORK=off`; local Hugo 0.166.0 extended.
- `GOWORK=off make check`: module verification, strict Hugo build, brand checks,
  rendered HTML/Markdown/LLMS internal links.
- `git diff --check`.
- Browser checks at desktop (1230 CSS px) and phone (390 CSS px) widths: page
  headings, overflow and image loading; selected pages also checked at tablet
  and narrow-phone widths. Both languages were exercised.
- Mobile drawer, its policy links, Escape close behavior, site search and result
  navigation, language switching, and light/dark theme controls.
- Database and object-storage calculator updates after changing vCPU, capacity
  and monthly/yearly display; no observed browser script errors.
- Company metadata and project licenses reviewed separately. All six project
  licenses matched their current GitHub repositories at review time.

Deployment configuration pins Hugo 0.164.0; the local build used 0.166.0.
These results establish local implementation and checks, not a production
publication, account submission or approval. No commit or push was made.
Existing working-tree changes to the theme pin, resource links and README were
retained. The local preview is available while the Hugo server is running.

## 2026-10-03 — presentation and content review

This is a new local review, separate from the dated company verification above.
The existing homepage change was saved as `bb8737f` before this work. The visual
baseline was `e68dd1f` plus that checkpoint; history was compared with `9132638`
and the earlier `cd184be` site. No push or deployment was performed.

### Findings and changes

- **English wrapping:** four-column service cards spent much of their title
  width on horizontal icons and padding. Resource headings combined hard line
  breaks with a 310px column. Several tablet grids stayed at three columns until
  540px. Titles now receive usable width, secondary headings wrap naturally,
  and content grids step down at appropriate widths. Card bottoms align through
  layout instead of paragraph minimum-height rules.
- **Responsive navigation:** the portal hid navigation at 860px, while the
  theme only exposed its drawer below 768px. The theme also hid desktop text
  labels below 992px, while the portal hid the corresponding icons. The portal
  now uses the labelled drawer below 992px and retains the PGSTY wordmark.
  Narrow phones keep search and menu visible, with language/theme in the drawer.
- **Corporate presentation:** retained the blue palette, restrained gradients,
  cards, two-line hero, and stack overview. Replaced simulated cluster status,
  flashing green dots and emoji statistics with a static capability overview.
  Removed snapshot versions/star counts from project cards without refreshing
  the underlying data. The homepage follows software → resources → services;
  its company link explicitly leads to the company and founder.
- **Claims and context:** removed unqualified savings percentages, zero-downtime
  migration/upgrade claims, sub-second failover/RPO guarantees and blanket cloud
  product comparisons. Retained workload scenarios and selection criteria.
  Service-plan summaries now include the existing agreement/response-target
  note; on-demand Chinese copy no longer implies onsite delivery by default.
- **Product accuracy:** corrected [pgwasm](https://github.com/pgsty/pgwasm) to
  WebAssembly inside PostgreSQL, and [pgs3](https://github.com/pgsty/pgs3) to
  S3-compatible storage backed by PostgreSQL, with early-alpha scope. Corrected
  [Capslock](https://github.com/Vonng/Capslock) to the public Karabiner project.
  Tools are no longer collectively described as self-developed Apache software.
- **Text exports:** projects and services previously omitted much of their
  bespoke HTML content from Markdown. The export now uses the existing project,
  resource and service data. The six additional tools share bilingual front
  matter between HTML and Markdown, avoiding separate descriptions.
- **Other details:** fixed long URLs, narrow calculator controls and company
  sidebars; improved dark-mode secondary-text contrast; restored reduced-motion
  behavior; added the 404 skip link and consistent language targets.

### Content retained and follow-up opportunities

The main content has not broadly shrunk: all six core projects, six additional
tools, public resources and the monitoring demo remain. The cloud-exit page
retains three comparison charts, two calculators, dated assumptions/sources,
industry examples, migration steps, responsibility discussion, articles and FAQ.
Much of the old homepage detail now lives in dedicated pages.

Founder/background visibility was weaker on the homepage; the company page
still contains the founder, experience and project history. The old MiraclePlus
S22 and PGDG LoongArch milestones should only return with suitable sources.
Do not restore old language-dependent company identities, inferred team sizes,
blanket portfolio licenses or the implication that the company began in 2018.

The next useful content addition would be a verified engineering case showing
workload, constraints, delivered work and measured outcomes, or a sourced
contribution timeline. Those inputs were not supplied or invented in this pass.

### Local validation

- Hugo Extended 0.166.0, Go 1.27.1, pinned OINK v1.1.0 with `GOWORK=off`.
- Strict build, module verification, brand checks, rendered internal links and
  `git diff --check` passed. This does not establish CI or deployment success.
- Browser geometry checks covered 22 bilingual routes at 320, 390, 768, 1024 and
  1440 CSS pixels (110 combinations). Identified 320px failures were fixed and
  rerun. Scrollable code blocks and comparison tables are intentional exceptions.
- Sixteen additional light/dark counterpart checks covered the home, software,
  services and pricing pages; desktop and phone screenshots were inspected.
- Exercised labelled navigation at 820px and 390px, Escape/focus restoration,
  Chinese and English search results, search navigation, language switching,
  synchronized theme attributes and reduced-motion preferences.
- Both calculator outputs changed when inputs changed. Database vCPU and yearly
  display, and object-storage capacity were exercised. Calculator data remains
  a dated illustrative model and was not repriced.
- 404 skip/navigation/language targets checked; no browser warnings or errors
  observed in the final inspected session.

Screenshots and layout measurements are in ignored `tmp/review-20261003/`.
The independent pinned-theme preview uses `http://localhost:1316/`; existing
previews on other ports were not stopped. Company registration and mailbox
operation were not reverified in this presentation review.
