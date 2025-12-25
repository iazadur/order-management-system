#!/bin/bash

echo "Checking required environment variables..."

# Ensure required environment variables are not empty
# test -n "$NEXT_PUBLIC_API_URL"

# Replace environment variables in the built files
# find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#NEXT_PUBLIC_API_URL#$NEXT_PUBLIC_API_URL#g"

# Start the Next.js application
echo "Starting Next.js application..."
exec "$@"