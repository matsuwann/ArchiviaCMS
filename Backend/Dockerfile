# Use a lightweight Node.js image
FROM node:20-slim

# Install required system dependencies for pdf2pic
RUN apt-get update && apt-get install -y \
    graphicsmagick \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]