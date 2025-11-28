# Use Node.js
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only backend folder
COPY backend/ ./backend/

# Move into backend
WORKDIR /app/backend

# Install dependencies
RUN npm install --production

# Expose backend port
EXPOSE 10000

# Start the server
CMD ["node", "server.js"]
