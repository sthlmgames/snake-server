#!/usr/bin/env bash
git clone https://github.com/sthlmgames/snake-client.git
cd snake-client
npm install
sed -ie 's/http:\/\/localhost:3000//g' src/components/utils/utils.js
npm run build
cd ../
mkdir -p public
cp -r snake-client/public/ ../public
# rm -rf snake-client

