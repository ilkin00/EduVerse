FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Use legacy peer deps to avoid conflict
RUN npm install --legacy-peer-deps
RUN npm install react-native-i18n
# Copy app files
COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "--clear"]
