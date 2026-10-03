{{- /* Machine-readable companion for the portal's bespoke HTML layouts. */ -}}
{{- $zh := eq .Site.Language.Lang "zh" -}}
# {{ .Title | strings.TrimSpace }}

{{ with .Description | strings.TrimSpace -}}
> {{ replace . "\n" "\n> " }}

{{ end -}}
{{ with .Site.Home.OutputFormats.Get "LLMS" -}}
{{ cond $zh "LLMS 索引" "LLMS index" }}: [llms.txt]({{ .RelPermalink }})

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
