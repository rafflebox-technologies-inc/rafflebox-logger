#!/bin/bash
set -e

yarn build
yarn test

cp package.json build
cd build

npm login --scope @rafflebox-technologies-inc --registry https://npm.pkg.github.com
npm publish
