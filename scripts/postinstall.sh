#!/usr/bin/env bash
git clone https://github.com/sthlmgames/snake-client.git
cd snake-client
npm install
npm run build
cd ../
mkdir -p public
cp -r snake-client/public/ ../public
# rm -rf snake-client

