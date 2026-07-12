FROM node:18-slim

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install npm packages
RUN npm install

# Copy application files
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Launch dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
