FROM node:18-alpine

WORKDIR /app

# Kopieer package.json en package-lock.json
COPY package*.json ./

# Installeer dependencies
RUN npm ci --only=production

# Kopieer de rest van de applicatie
COPY . .

# Poort waarop de applicatie draait
EXPOSE 3000

# Start de applicatie
CMD ["node", "src/index.js"]
