# Use Node.js 20 with build tools for native modules
FROM node:20-alpine

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --build-from-source

# Copy backend source code
COPY backend/ ./

# Create directories
RUN mkdir -p database uploads

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
