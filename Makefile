DIST := ./dist
CLI := cli/cli/index.js

all: build

build:
	npm run build

dev: 
	npm run dev

test: $(CLI)
	npm run test

clean: partial-clean

partial-clean::
	rm -rf $(DIST)

.PHONY: all build dev test clean partial-clean