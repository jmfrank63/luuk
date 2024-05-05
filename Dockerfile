# Use the full Node.js 22 Alpine image to build the application
FROM node:22-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the application files
COPY src ./src
COPY html ./html

# Build the application (if necessary)
# RUN npm ci --only=production

# Use the minimal Alpine image to run the application
FROM alpine:3.19

# Install Node.js and necessary libraries
# RUN apk add --no-cache libstdc++ ca-certificates
# COPY --from=build /usr/local/bin/node /usr/local/bin/
RUN apk add --no-cache nodejs

# Set the working directory
WORKDIR /app

# Copy the built application from the build stage
COPY --from=build /app/src ./src
COPY --from=build /app/html ./html

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "src/server.js" ]
