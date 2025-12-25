# 1️⃣ Use Node official image
FROM node:18-alpine

# 2️⃣ Set working directory inside container
WORKDIR /app

# 3️⃣ Copy backend package files
COPY backend/package*.json ./backend/

# 4️⃣ Install backend dependencies
RUN cd backend && npm install

# 5️⃣ Copy backend source code
COPY backend ./backend

# 6️⃣ Expose port (Render uses this)
EXPOSE 10000

# 7️⃣ Start backend server
CMD ["node", "backend/server.js"]
