FROM node:18-alpine

WORKDIR /app

# Kopieer package.json en package-lock.json
COPY package*.json ./

# Installeer alle dependencies inclusief development dependencies
RUN npm install

# Poort waarop Vite draait
EXPOSE 5173

# Start de development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
