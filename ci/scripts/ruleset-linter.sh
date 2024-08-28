#!/bin/bash
set -x
set -v
set -e

RULESETS="$PWD/ci/rulesets/*.yaml"

for FILE in $PWD/ruleset*.yaml
do
  bob -r $FILE --dryrun $(bob -r $FILE -lq | grep -vE '^(\w|-)*\.')
done

for FILE in $RULESETS
do
  bob -r $FILE --dryrun $(bob -r $FILE -lq | grep -vE '^(\w|-)*\.')
done