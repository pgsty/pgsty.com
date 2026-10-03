---
title: "软件与开源项目"
description: "了解 PGSTY 软件、扩展项目与开发工具，覆盖 PostgreSQL 部署、对象存储、软件包管理、监控和本地测试。"
layout: "projects"
translationKey: "projects"
search_keywords: [软件, 项目, 开源, Pigsty, Silo, PIG, pg_exporter, SOW, Barn, pgs3, pgwasm, pgnls, 基础设施]
tools:
  # 暂时隐藏，待源码仓库公开可访问后恢复。
  # - name: gb18030_2022
  #   icon: fa-language
  #   tags: C · Extension · GB 18030-2022
  #   description: "为 PostgreSQL 提供 GB 18030-2022 字符集转换支持，覆盖中文人名、地名等场景使用的字符。"
  #   url: https://github.com/pgsty/gb18030_2022
  - name: pgs3
    icon: fa-cloud-arrow-down
    tags: Rust · PostgreSQL 扩展 · 早期 Alpha
    description: "在 PostgreSQL 内提供 S3 兼容对象存储，将对象与元数据保存在数据库中。目前处于早期 Alpha，供实验评估。"
    url: https://github.com/pgsty/pgs3
  - name: pgwasm
    icon: fa-globe
    tags: WebAssembly · SQL 函数 · 上游分支
    description: "在 PostgreSQL 内运行 WebAssembly 组件，并将其映射为带类型的 SQL 函数。本仓库是上游 pgwasm 项目的分支。"
    url: https://github.com/pgsty/pgwasm
  - name: pgnls
    icon: fa-comments
    tags: Gettext · NLS · PostgreSQL
    description: "翻译 PostgreSQL 服务端消息与命令行工具，提供维护、审阅中文本地化成果的配套工具。"
    url: https://github.com/pgsty/pgnls
  - name: pgext
    icon: fa-puzzle-piece
    tags: 元数据 · 扩展目录 · 兼容性
    description: "维护 PostgreSQL 扩展目录与元数据，帮助用户查找扩展用途、支持版本及可用软件包。"
    url: https://pgext.cloud/
  - name: Capslock
    icon: fa-keyboard
    tags: Karabiner-Elements · macOS · 键位配置
    description: "通过键位配置将 Caps Lock 扩展为组合键层，在 macOS 上完成光标导航、窗口控制与开发快捷操作。"
    url: https://github.com/Vonng/Capslock
---

## 可查看源码、可实际评估的软件

PGSTY 开发与维护用于 PostgreSQL 部署、对象存储、包管理、监控、仓库发布与本地测试的软件，也参与扩展与开发工具项目。上方链接提供各项目的源码与文档。

安装要求、支持平台和发行版本请以各项目文档为准。对于生产部署，可以通过 [PGSTY 专业服务](/zh/services/)获得架构评估、迁移实施与运维交接协助。

## 开源许可与商业技术支持

各项目分别适用自己的许可证：Pigsty、PIG、pg_exporter、SOW、Barn 与 OINK 采用 Apache-2.0；Silo 采用 AGPL-3.0；pgwasm 采用 BSD-3-Clause。贡献代码、译文和依赖保留各自适用的条款，具体请查阅对应仓库的许可证文件。

公开项目文档、发行版本和社区讨论可以通过项目链接访问。商业支持需要另行约定服务范围；开源软件的公开提供本身不构成技术支持或服务等级承诺。
