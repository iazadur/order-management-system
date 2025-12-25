# Stage 1: Setup Node.js with NVM
FROM ubuntu:25.04 AS base

# Set working directory
WORKDIR /app

# This command check if curl is available on the base image
# docker run --rm ubuntu:25.04 sh -c "apt-get update && apt-cache policy curl"

# Install dependencies
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && \
    bash -c "source /root/.nvm/nvm.sh && \
    nvm install 22.17.0 && \
    nvm alias default 22.17.0" && \
    rm -rf /root/.cache

# Stage 2: Install dependencies
FROM ubuntu:25.04 AS deps

# Set working directory
WORKDIR /app

# Copy NVM from the base stage
COPY --from=base /root/.nvm /root/.nvm

# Set Node.js environment
ENV NODE_VERSION="22.17.0"
ENV NVM_DIR="/root/.nvm"
ENV PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install npm packages with caching
RUN npm i --legacy-peer-deps

# Stage 3: Build the project
FROM ubuntu:25.04 AS builder

# Set working directory
WORKDIR /app

# Copy NVM from the base stage
COPY --from=base /root/.nvm /root/.nvm

# Set Node.js environment
ENV NODE_VERSION="22.17.0"
ENV NVM_DIR="/root/.nvm"
ENV PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

# Copy necessary files including node_modules
COPY ./ ./
COPY --from=deps /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the project
RUN npm run build

# Stage 4: Serve the project
FROM ubuntu:25.04 AS runner

# Set working directory
WORKDIR /app

# Copy NVM and Node.js binaries for non-root user
COPY --from=base /root/.nvm /home/nextjs/.nvm

# Set Node.js environment for non-root user
ENV NODE_VERSION="22.17.0"
ENV NVM_DIR="/home/nextjs/.nvm"
ENV PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/entrypoint.sh ./

# Ensure entrypoint.sh is executable, Create a non-root user and set ownership
RUN chmod +x /app/entrypoint.sh \
    && groupadd -g 1001 nodejs \
    && useradd -u 1001 -g nodejs -s /bin/bash nextjs \
    && chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Start the server
CMD ["node", "server.js"]