FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Use legacy peer deps to avoid conflicts
RUN npm install --legacy-peer-deps

# Copy app files
COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "--tunnel"]
