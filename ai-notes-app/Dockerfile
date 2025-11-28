FROM node:18-alpine
WORKDIR /app
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm install --production
EXPOSE 10000
CMD [\"node\",\"server.js\"]
