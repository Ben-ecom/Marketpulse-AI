FROM node:18-alpine AS build

WORKDIR /app

# Kopieer package.json en package-lock.json
COPY package*.json ./

# Installeer alle dependencies
RUN npm ci

# Kopieer de rest van de applicatie
COPY . .

# Optioneel: Bouw de applicatie als er een build stap is
# RUN npm run build

# Productie image
FROM node:18-alpine

WORKDIR /app

# Kopieer package.json en package-lock.json
COPY package*.json ./

# Installeer alleen productie dependencies
RUN npm ci --only=production

# Kopieer de applicatie van de build stage
COPY --from=build /app/src ./src
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/config ./config

# Maak een logs directory
RUN mkdir -p /app/logs

# Maak een niet-root gebruiker voor security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Poort waarop de applicatie draait
EXPOSE 3000

# Gezondheidscheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Start de applicatie
CMD ["node", "src/index.js"]
