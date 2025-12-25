#!/bin/sh
set -e

echo "Waiting for database to be ready..."
# Wait for postgres to be ready
until nc -z postgres 5432; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is ready!"

echo "Running Prisma migrations..."
# Check if migrations directory exists and has content
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null | grep -v migration_lock.toml)" ]; then
  echo "Found migrations, deploying..."
  # Use prisma migrate deploy for production (applies pending migrations)
  npx prisma migrate deploy || {
    echo "⚠️  Migration deploy failed, trying db push as fallback..."
    npx prisma db push --accept-data-loss || true
  }
else
  echo "⚠️  No migrations found or empty, using db push for initial setup..."
  # Use db push to create tables from schema (for initial setup)
  npx prisma db push --accept-data-loss || {
    echo "❌ Failed to push schema. Check database connection and permissions."
    exit 1
  }
fi

# Seed the database
echo "Seeding database..."
# Check if seed file exists
if [ -f "db/seed.ts" ]; then
  echo "Found seed file at db/seed.ts"
  echo "Running seed script..."
  # Run the seed file using tsx
  set +e
  tsx db/seed.ts
  SEED_EXIT_CODE=$?
  set -e
  if [ $SEED_EXIT_CODE -eq 0 ]; then
    echo "✅ Seed completed successfully"
  else
    echo "❌ Seed script exited with code $SEED_EXIT_CODE"
    echo "⚠️  Check logs above for error details"
  fi
else
  echo "⚠️  Seed file not found at db/seed.ts"
  echo "⚠️  Skipping database seeding..."
fi

echo "Starting application..."
exec node dist/index.js

