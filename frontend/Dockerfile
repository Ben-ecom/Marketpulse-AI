FROM node:18-alpine as build

WORKDIR /app

# Kopieer package.json en package-lock.json
COPY package*.json ./

# Installeer dependencies
RUN npm ci

# Kopieer de rest van de applicatie
COPY . .

# Bouw de applicatie
RUN npm run build

# Productie image
FROM nginx:alpine

# Kopieer de gebouwde bestanden naar nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Kopieer nginx configuratie
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Poort waarop nginx draait
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
