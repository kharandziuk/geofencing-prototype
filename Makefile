.PHONY: down-up

default: down-up

down-up:
	node db-down.js || true &&\
	node db-up.js

