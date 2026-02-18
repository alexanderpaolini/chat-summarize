# Use lightweight Node.js Alpine image
FROM node:20-alpine

# Enable corepack to use pnpm (included with Node.js 20)
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (includes tsx and dotenv-cli needed for runtime)
RUN pnpm install --frozen-lockfile

# Copy source code and configuration
COPY . .

# Start the application
CMD ["pnpm", "start"]
