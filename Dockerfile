# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@10.5.2 --activate \
  && pnpm install --frozen-lockfile

# Build application
COPY . .
RUN pnpm build

# Runtime stage
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
