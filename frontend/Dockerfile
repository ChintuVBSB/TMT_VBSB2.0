# Stage 1: Build React app with Vite
FROM node:18 AS build
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend files
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expose nginx default port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
