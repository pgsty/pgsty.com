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
