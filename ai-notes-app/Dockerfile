FROM node:18-alpine
WORKDIR /app

# copy backend folder into the image
COPY backend/ ./backend/

WORKDIR /app/backend

# install production deps
RUN npm ci --production

EXPOSE 10000

CMD ["node","server.js"]
