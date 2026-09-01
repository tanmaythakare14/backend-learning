#!/usr/bin/env bash

cd "$(dirname "$0")/.."

trap 'kill 0' EXIT INT TERM

echo "Installing dependencies..."
yarn install

echo "Starting API and Web dev servers via Nx (Ctrl+C to stop both)..."

yarn start:api 2>&1 | while IFS= read -r line; do printf '[API] %s\n' "$line"; done &
yarn start:web 2>&1 | while IFS= read -r line; do printf '[WEB] %s\n' "$line"; done &

wait
