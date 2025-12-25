# 1️⃣ Use Node official image
FROM node:18-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm install

# 5️⃣ Copy all backend source code
COPY . .

# 6️⃣ Expose backend port
EXPOSE 10000

# 7️⃣ Start backend server
CMD ["npm", "start"]
