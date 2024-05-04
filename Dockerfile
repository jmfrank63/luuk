# Use the full Node.js 22 Alpine image to build the application
FROM node:22-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the application files
COPY . .

# Build the application (if necessary)
# RUN npm ci --only=production

# Use the minimal Alpine image to run the application
FROM alpine:3.18

# Install Node.js
RUN apk add --no-cache nodejs

# Set the working directory
WORKDIR /app

# Copy the built application from the build stage
COPY --from=build /app .

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "src/server.js" ]


