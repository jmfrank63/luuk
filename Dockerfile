# Use an official Node.js runtime as the base image
FROM node:22

# Set the working directory in the container to /app
WORKDIR /app

# Copy the rest of the application to the working directory
COPY src src

# Make port 3000 available to the outside world
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "src/server.js" ]
