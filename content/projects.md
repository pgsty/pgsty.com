---
title: "Software & Open-source Projects"
description: "Explore PGSTY software, extension projects, and developer tools: PostgreSQL deployment, object storage, package management, monitoring, and local testing."
layout: "projects"
translationKey: "projects"
search_keywords: [software, projects, open source, Pigsty, Silo, PIG, pg_exporter, SOW, Barn, pgs3, pgwasm, pgnls, infrastructure]
tools:
  # Temporarily hidden until the public repository is available.
  # - name: gb18030_2022
  #   icon: fa-language
  #   tags: C · Extension · GB 18030-2022
  #   description: "PostgreSQL character set conversion support for GB 18030-2022, including characters used in Chinese personal and place names."
  #   url: https://github.com/pgsty/gb18030_2022
  - name: pgs3
    icon: fa-cloud-arrow-down
    tags: Rust · PostgreSQL Extension · Early Alpha
    description: "S3-compatible object storage inside PostgreSQL, keeping objects and metadata in the database. An early alpha project for evaluation."
    url: https://github.com/pgsty/pgs3
  - name: pgwasm
    icon: fa-globe
    tags: WebAssembly · SQL Functions · Upstream Fork
    description: "Run WebAssembly components inside PostgreSQL and expose them as typed SQL functions. Our fork follows the upstream pgwasm project."
    url: https://github.com/pgsty/pgwasm
  - name: pgnls
    icon: fa-comments
    tags: Gettext · NLS · PostgreSQL
    description: "Chinese translations of PostgreSQL server messages and command-line tools, with tooling to maintain and review localization work."
    url: https://github.com/pgsty/pgnls
  - name: pgext
    icon: fa-puzzle-piece
    tags: Metadata · Catalog · Compatibility
    description: "An extension catalog and metadata pipeline for finding PostgreSQL extensions, supported versions, and available packages."
    url: https://pgext.cloud/
  - name: Capslock
    icon: fa-keyboard
    tags: Karabiner-Elements · macOS · Keyboard
    description: "Keyboard configurations that turn Caps Lock into a modifier for navigation, window control, and developer shortcuts on macOS."
    url: https://github.com/Vonng/Capslock
---

## Software you can inspect and evaluate

PGSTY develops and maintains software for PostgreSQL deployment, object storage, package management, monitoring, repository publishing, and local testing. We also contribute to extension and developer tool projects. The links above lead to their source code and documentation.

Start with the relevant project documentation for installation requirements, supported platforms, and releases. For a production deployment, [our professional services](/services/) can help with assessment, implementation, and operational handover.

## Project licences and commercial support

Licences vary by project: Pigsty, PIG, pg_exporter, SOW, Barn, and OINK use Apache-2.0; Silo uses AGPL-3.0; pgwasm uses BSD-3-Clause. Contributions, translations, and dependencies retain their applicable terms. Refer to each repository's licence file for details.

Public documentation, releases, and community discussions are available through the project links. Commercial support is a separate engagement with an agreed scope; availability of open-source software does not create a support or service-level commitment.
