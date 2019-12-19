DIST := ./dist

all: build

build:
	npm run build

dev: 
	npm run dev

clean: partial-clean

partial-clean::
	rm -rf $(DIST)

.PHONY: all build dev clean partial-clean