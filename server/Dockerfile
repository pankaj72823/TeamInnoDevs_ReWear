# syntax=docker/dockerfile:1

FROM node:18-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY --link package.json package-lock.json ./

# Install dependencies using npm ci for a clean and deterministic install
RUN --mount=type=cache,target=/root/.npm npm ci --production

# Copy the application source code
COPY --link . .

# Expose the port the application will run on
EXPOSE 5000

# Set the environment to production
ENV NODE_ENV=production

# Define the command to run the application
CMD ["npm", "start"]