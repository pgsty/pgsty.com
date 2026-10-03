---
title: "Solutions"
description: "PostgreSQL infrastructure and migration solutions from PGSTY: workload blueprints, cloud-exit assessments, decision matrices, and enterprise production environments."
translationKey: "solutions"
search_keywords: [solutions, migration, cloud exit, self-hosting, infrastructure, pgvector, PostGIS, TimescaleDB, Patroni]
search_boost: 1.2
---
PGSTY solutions combine open-source software, engineering, and an agreed support scope. Evaluate cost, reliability, migration complexity, and your team's operational capacity together.

## Deployment and migration

- **[Cloud exit and database migration](/solutions/cloud-exit/)** — Compare managed databases, cloud virtual machines, and your own infrastructure. The historical cost model and staged migration process provide a starting point for an assessment, not a savings guarantee.
- **[Production PostgreSQL platform](/services/)** — Plan high availability, backup and recovery, observability, and routine changes around your workload, then validate the environment and hand over operations.

## Workload scenarios

These scenarios are starting points for architecture discussions. Evaluate extension compatibility, capacity, and recovery objectives against your workload, then validate the design.

1. **AI and vector retrieval (`pgvector` · `pgvectorscale` · `pg_search`)** — Combine vector and full-text extensions in PostgreSQL, choosing indexes around your data and queries.
2. **Geospatial data (`PostGIS` · `pgRouting` · `h3`)** — Model maps and location services with spatial types, routing, and hexagonal indexes.
3. **IoT and time series (`TimescaleDB` · `pg_timeseries`)** — Evaluate partitioning, compression, and rollups against ingestion, retention, and query needs. Features vary by extension and version.
4. **Availability and recovery (`Patroni` · `etcd` · `PgBouncer`)** — Design failover and connection pooling. Validate RPO and RTO for the chosen replication mode and failure scenarios.
5. **Analytics and integration (`DuckDB FDW` · `Citus` · columnar storage)** — Evaluate data access, columnar execution, or sharding and test query performance with representative data.
6. **Private and offline deployments (`Silo` · `PIG` · `SOW`)** — Prepare private repositories, local S3 storage, and offline packages, with a defined platform and update process.

## Self-hosted or managed?

Compare control, operational responsibility, and total cost. The right choice depends on the service, your team, and your business requirements.

| Dimension | Self-hosted with PGSTY | Managed cloud database |
| --- | --- | --- |
| Extensions | Choose compatible packages from public repositories; validate each version and platform. | Check available extensions and permissions for the service, version, and region. |
| Distributions | Select PostgreSQL or a compatible distribution and validate workload compatibility. | Choose from the provider's supported engines, versions, and configurations. |
| Total cost | Budget for hardware or VMs, staffing, support, backup, and migration. | Review service fees, storage, I/O, networking, and committed-use discounts. |
| Observability | Configure metrics and logs, with access to host-level diagnostics. | Use provider diagnostic interfaces; check access and retention. |
| Control and portability | Control deployment, access, and backup policies; own security and operations. | Work within the shared responsibility model; assess export and migration paths. |
| Upgrades | Rehearse upgrades, extension compatibility, downtime, and rollback. | Review maintenance options, version lifecycle, and upgrade policy. |
