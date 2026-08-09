HUGO ?= hugo

.PHONY: dev build check update-theme

dev:
	$(HUGO) server --disableFastRender

build:
	$(HUGO) build --minify --cleanDestinationDir

check:
	go mod verify
	$(HUGO) build --minify --cleanDestinationDir --printPathWarnings --printI18nWarnings --panicOnWarning
	python3 bin/check_internal_links.py public

update-theme:
	go get -u github.com/pgsty/oink
	$(HUGO) mod tidy
