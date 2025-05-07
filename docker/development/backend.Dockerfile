FROM node:18-alpine

WORKDIR /app

# Kopieer package.json en package-lock.json
COPY package*.json ./

# Installeer alle dependencies inclusief development dependencies
RUN npm install

# Poort waarop de applicatie draait
EXPOSE 3000

# Start de applicatie in development mode met nodemon
CMD ["npm", "run", "dev"]
