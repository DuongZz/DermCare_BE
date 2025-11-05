# Stage 1: Build TS
FROM node:22.13.1 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npx playwright install --with-deps

COPY . .
RUN npm run build


# Stage 2: Production
FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

# Copy những thứ cần thiết từ builder
COPY --from=builder /app/src/templates ./src/templates
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ecosystem.config.js ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env.prod ./.env.prod

EXPOSE 8888

RUN npm install -g pm2

CMD ["pm2-runtime", "ecosystem.config.js"]
