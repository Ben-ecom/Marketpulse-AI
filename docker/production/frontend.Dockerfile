FROM node:18-alpine AS build

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

# Maak een niet-root gebruiker voor security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/share/nginx/html

# Poort waarop nginx draait
EXPOSE 80
EXPOSE 443

# Gezondheidscheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
