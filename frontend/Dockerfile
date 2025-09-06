# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set default environment variables for build
ENV VITE_API_BASE_URL=http://localhost:3020/api
ENV VITE_TASK_SCHEDULER_URL=http://localhost:3030

# Build the application
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create a runtime configuration script
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'cat > /usr/share/nginx/html/config.js << EOF' >> /docker-entrypoint.sh && \
    echo 'window.APP_CONFIG = {' >> /docker-entrypoint.sh && \
    echo '  API_BASE_URL: "${VITE_API_BASE_URL:-http://backend:3020/api}",' >> /docker-entrypoint.sh && \
    echo '  TASK_SCHEDULER_URL: "${VITE_TASK_SCHEDULER_URL:-http://task-scheduler:3030}"' >> /docker-entrypoint.sh && \
    echo '};' >> /docker-entrypoint.sh && \
    echo 'EOF' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Start nginx with runtime configuration
CMD ["/docker-entrypoint.sh"]
