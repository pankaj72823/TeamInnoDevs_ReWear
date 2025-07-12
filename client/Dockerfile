# Build stage
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Install dependencies and build the project
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve the built app using NGINX
FROM nginx:alpine

# Copy the build output to the NGINX HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the necessary port (e.g., 80 for React)
EXPOSE 80

# Command to run NGINX
CMD ["nginx", "-g", "daemon off;"]
