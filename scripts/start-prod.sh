#!/bin/sh
set -e

echo "🔧 Syncing database schema..."
npx prisma db push --url "$DATABASE_URL" --accept-data-loss 2>&1 || {
  echo "⚠️  Schema push failed, trying with force-reset..."
  npx prisma db push --url "$DATABASE_URL" --force-reset --accept-data-loss
  echo "🌱 Database was reset, running seed..."
  npx tsx prisma/seed.ts
  echo "🚀 Starting GustoPro server..."
  exec npx tsx src/server/index.ts
}

echo "🌱 Checking if seed is needed..."
npx tsx scripts/seed-if-empty.ts || {
  echo "🌱 Running database seed..."
  npx tsx prisma/seed.ts
}

echo "🚀 Starting GustoPro server..."
exec npx tsx src/server/index.ts
