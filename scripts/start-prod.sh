#!/bin/sh
set -e

echo "🔧 Syncing database schema..."
npx prisma db push --url "$DATABASE_URL" --skip-generate

echo "🌱 Checking if seed is needed..."
npx tsx scripts/seed-if-empty.ts || {
  echo "🌱 Running database seed..."
  npx tsx prisma/seed.ts
}

echo "🚀 Starting GustoPro server..."
exec npx tsx src/server/index.ts
