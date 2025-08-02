FROM node:18
WORKDIR /app

# Copy and install backend dependencies
COPY package*.json ./
RUN npm install

# Copy all backend files
COPY . .

# Expose backend port
EXPOSE 8000

CMD ["npm", "start"]
