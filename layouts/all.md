{{- /* Machine-readable companion for the portal's bespoke HTML layouts. */ -}}
{{- $zh := eq .Site.Language.Lang "zh" -}}
# {{ .Title | strings.TrimSpace }}

{{ with .Description | strings.TrimSpace -}}
> {{ replace . "\n" "\n> " }}

{{ end -}}
{{ with .Site.Home.OutputFormats.Get "LLMS" -}}
{{ cond $zh "LLMS 索引" "LLMS index" }}: [llms.txt]({{ .RelPermalink }})

{{ end -}}
{{ if eq .Params.layout "projects" -}}
## {{ cond $zh "主要软件项目" "Core software projects" }}

{{ range $key := slice "pigsty" "silo" "pig" "barn" "sow" "pg_exporter" -}}
{{ range where hugo.Data.portal.projects "key" $key -}}
- **[{{ .name }}]({{ cond $zh .siteZh .site }})** — {{ cond $zh .summaryZh .summary }} {{ .license }}. [{{ cond $zh "源码" "Source" }}]({{ .repo }}).
{{ end -}}
{{ end }}
## {{ cond $zh "扩展与开发工具" "Extensions and developer tools" }}

{{ range .Params.tools -}}
- **[{{ .name }}]({{ .url }})** — {{ .description }}
{{ end }}
## {{ cond $zh "公共资源" "Shared resources" }}

{{ range hugo.Data.portal.resources -}}
- **[{{ cond $zh .nameZh .name }}]({{ if $zh }}{{ .urlZh | default .url }}{{ else }}{{ .url }}{{ end }})** — {{ cond $zh .descZh .desc }}
{{ end }}
{{ end -}}
{{ if eq .Params.layout "services" -}}
## {{ cond $zh "服务与典型交付" "Services and typical deliverables" }}

{{ range .Params.services -}}
### {{ .title }}

{{ .desc }}

{{ cond $zh "典型交付：" "Typical deliverables: " }}{{ .deliverables }}

{{ end -}}
## {{ cond $zh "合作流程" "How we work" }}

{{ range $i, $step := .Params.steps -}}
{{ add $i 1 }}. **{{ $step.title }}** — {{ $step.desc }}
{{ end }}
[{{ cond $zh "查看方案与价格" "View plans and pricing" }}]({{ relLangURL "price/" }})

{{ end -}}
{{ if eq .Params.layout "impact" -}}
{{ partial "portal/impact-markdown.html" (dict "page" . "compact" false) }}
{{ end -}}
{{ with .RenderShortcodes | strings.TrimSpace -}}
---

{{ . }}

{{ end -}}
{{ if .IsHome -}}
{{ partial "portal/impact-markdown.html" (dict "page" . "compact" true) }}
{{ end -}}
{{ with .Pages -}}
---

## {{ cond $zh "本节页面" "Section pages" }}

{{ range . -}}
{{ $url := .RelPermalink -}}
{{ with .OutputFormats.Get "markdown" }}{{ $url = .RelPermalink }}{{ end -}}
- [{{ .Title | strings.TrimSpace }}]({{ $url }}){{ with .Description | strings.TrimSpace }}: {{ . }}{{ end }}
{{ end -}}
{{ end -}}
