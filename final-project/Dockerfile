FROM node:24.18.1-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN mkdir -p results

ENTRYPOINT ["npx", "tsx", "src/main.ts"]
