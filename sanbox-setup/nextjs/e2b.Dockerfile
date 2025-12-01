FROM node:20-slim AS base

# Install system dependencies
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create directory structure
RUN mkdir -p /home/user
WORKDIR /home/user

# Create Next.js app with TypeScript
RUN npx --yes create-next-app@16.0.4 . --yes --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install and configure shadcn/ui
RUN npx --yes shadcn@3.5.0 init --yes -b neutral --force
RUN npx --yes shadcn@3.5.0 add --all --yes

# Install tailwind animatecss plugin
RUN npm install -D tailwindcss-animate tailwind-scrollbar-hide

# Copy and setup compile script
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Expose the development server port
EXPOSE 3000

# Set environment variables for Next.js
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV development