# syntax=docker/dockerfile:1

# Stage 1: build React/Vite app
FROM node:20-alpine AS build
WORKDIR /app

# Build-time API URL for Vite (can be overridden from compose)
ARG VITE_API_BASE_URL=http://localhost:5000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build-time Google OAuth Client ID for @react-oauth/google
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Install dependencies first for better Docker layer cache
COPY package*.json ./
RUN npm ci

# Copy source and build static assets into /app/dist
COPY . .
RUN npm run build

# Stage 2: serve static files with Nginx
FROM nginx:1.27-alpine AS runtime

# Replace default site config to support SPA routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Frontend will be accessible on container port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
