# Use a slim Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install required build tools for bcrypt
RUN apk add --no-cache python3 make g++ 

# Copy package files
COPY package*.json ./

# Install deps (prod only)
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 9000

# Run app
CMD ["node", "server.js"]
