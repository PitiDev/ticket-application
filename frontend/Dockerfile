# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only the built output from the build stage
COPY --from=build /app/.output /app/.output

# For Nuxt, you typically don't need to install production dependencies
# as they're bundled in the .output directory
# But if you must install dependencies, copy the package files and install
# COPY --from=build /app/package.json /app/package-lock.json ./
# RUN npm ci --omit=dev

EXPOSE 3000

# Start the server
CMD ["node", ".output/server/index.mjs"]