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
# Use prisma migrate deploy for production (applies pending migrations)
# This will apply all pending migrations. If no migrations exist, it will do nothing.
npx prisma migrate deploy

# Seed the database
echo "Seeding database..."
# Check if seed file exists
if [ -f "db/seed.ts" ]; then
  echo "Found seed file at db/seed.ts"
  echo "Running seed script..."
  # Run the seed file using tsx (installed globally in Dockerfile)
  # The seed script deletes all data first, then creates fresh seed data
  # Temporarily disable exit on error for seed (set +e)
  set +e
  tsx db/seed.ts
  SEED_EXIT_CODE=$?
  set -e
  if [ $SEED_EXIT_CODE -eq 0 ]; then
    echo "✅ Seed completed successfully"
  else
    echo "❌ Seed script exited with code $SEED_EXIT_CODE"
    echo "⚠️  Check logs above for error details"
    # Don't exit - allow app to start even if seed fails
  fi
else
  echo "⚠️  Seed file not found at db/seed.ts"
  echo "⚠️  Skipping database seeding..."
fi

echo "Starting application..."
exec node dist/index.js

