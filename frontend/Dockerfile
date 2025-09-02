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

# Stage 2: Serve with Nginx
FROM nginx:alpine

# ✅ Add our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ✅ Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
