FROM node:18-alpine
WORKDIR /app
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm ci --production
EXPOSE 10000
CMD [\"node\",\"server.js\"]
