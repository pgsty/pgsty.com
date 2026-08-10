HUGO ?= hugo
BIND ?= 127.0.0.1
PORT ?=
THEME_DIR ?= ../oink
THEME_MODULE ?= github.com/pgsty/oink
WORKSPACE := $(CURDIR)/go.work

.DEFAULT_GOAL := dev

.PHONY: b build c check d debug dev s serve update-theme workspace

b: build
c: check
d: debug
s: serve

dev:
	$(HUGO) server --disableFastRender --bind "$(BIND)" $(if $(strip $(PORT)),--port "$(PORT)")

debug: workspace
	@HUGO_MODULE_WORKSPACE="$(WORKSPACE)" $(HUGO) server \
		--disableFastRender \
		--bind "$(BIND)" $(if $(strip $(PORT)),--port "$(PORT)")

serve: dev

build:
	$(HUGO) build --minify --cleanDestinationDir

check:
	go mod verify
	$(HUGO) build --minify --cleanDestinationDir --printPathWarnings --printI18nWarnings --panicOnWarning
	python3 bin/check_internal_links.py public

update-theme:
	go get -u github.com/pgsty/oink
	$(HUGO) mod tidy

workspace:
	@test -f "$(THEME_DIR)/go.mod" || { \
		echo "OINK theme not found: $(THEME_DIR)" >&2; \
		exit 1; \
	}
	@test -f "$(WORKSPACE)" || go work init .
	@go work use .
	@go work edit -replace="$(THEME_MODULE)"="$(THEME_DIR)"
