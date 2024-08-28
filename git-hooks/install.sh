#!/bin/bash

GIT_HOOKS=".git/hooks/"

chmod +x git-hooks/commit-msg

cp -f git-hooks/commit-msg "${GIT_HOOKS}"

scp -p -P 29418 $USERNAME@gerrit-gamma.gic.ericsson.se:hooks/commit-msg git-hooks/commit-msg.d/gerrit-commit-msg