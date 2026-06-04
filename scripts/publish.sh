#!/bin/bash
set -e -u -o pipefail

version=$(cat package.json | jq -r '.version')
publish_opts=$(if echo "$version" | grep -q beta; then echo "--tag beta"; fi)

rm build -rf
yarn build
(cd build && npm publish $publish_opts)

git tag "v$version" -f
git push --tags
