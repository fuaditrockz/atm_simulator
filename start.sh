#!/bin/sh
cd "$(dirname "$0")" || exit 1
pnpm install
pnpm run dev
