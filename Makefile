HUGO ?= hugo
BIND ?= 127.0.0.1
PORT ?=
THEME_DIR ?= ../oink

.DEFAULT_GOAL := dev

.PHONY: b build c check d debug dev s serve update-theme

b: build
c: check
d: debug
s: serve

dev:
	HUGO_MODULE_REPLACEMENTS='github.com/pgsty/oink -> $(abspath $(THEME_DIR))' \
		$(HUGO) server --renderToMemory --bind "$(BIND)" $(if $(strip $(PORT)),--port "$(PORT)")

debug: dev

serve:
	$(HUGO) server --environment production --minify \
		--disableFastRender --disableLiveReload \
		--bind "$(BIND)" $(if $(strip $(PORT)),--port "$(PORT)")

build:
	$(HUGO) build --minify --cleanDestinationDir

check:
	go mod verify
	$(HUGO) build --minify --cleanDestinationDir --printPathWarnings --printI18nWarnings --panicOnWarning
	python3 bin/check_brand_claims.py
	python3 bin/check_internal_links.py public

update-theme:
	go get -u github.com/pgsty/oink
	$(HUGO) mod tidy
