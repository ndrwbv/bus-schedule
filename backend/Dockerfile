FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM node:20-alpine

# Chromium for Puppeteer
RUN apk add --no-cache chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
RUN apk del python3 make g++

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/index.js"]
