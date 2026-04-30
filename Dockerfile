# Use official Node.js image
FROM node:18

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Create app directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose port (change if your app uses different port)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
